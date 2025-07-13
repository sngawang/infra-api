provider "aws" {
  region = "us-east-1"
}

resource "aws_key_pair" "ssh_key" {
  key_name   = "snake-key"
  public_key = file(var.public_key_path)
}

#custom VPC and security group for the Snake Game EC2 instance
resource "aws_vpc" "web_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "snake-vpc"
  }
}

# Create public subnet
resource "aws_subnet" "snake_public_subnet" {
  vpc_id                  = aws_vpc.web_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "snake-public-subnet"
  }
}


# Create internet gateway
resource "aws_internet_gateway" "snake_igw" {
  vpc_id = aws_vpc.web_vpc.id

  tags = {
    Name = "snake-igw"
  }
}

# Create route table
resource "aws_route_table" "snake_route_table" {
  vpc_id = aws_vpc.web_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.snake_igw.id
  }

  tags = {
    Name = "snake-public-rt"
  }
}

# Associate route table with subnet
resource "aws_route_table_association" "snake_rta" {
  subnet_id      = aws_subnet.snake_public_subnet.id
  route_table_id = aws_route_table.snake_route_table.id
}


resource "aws_security_group" "snake_sg" {
  name        = "snake-game-sg"
  description = "Allow SSH and Flask app traffic"
  vpc_id      = aws_vpc.web_vpc.id

  ingress {
    description      = "Allow SSH"
    from_port        = 22
    to_port          = 22
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = []
    prefix_list_ids  = []
    security_groups  = []
    self             = false
  }

  ingress {
    description      = "Allow Flask HTTP"
    from_port        = 5000
    to_port          = 5000
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = []
    prefix_list_ids  = []
    security_groups  = []
    self             = false
  }

  egress {
    description      = "Allow all outbound"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = []
    prefix_list_ids  = []
    security_groups  = []
    self             = false
  }
}


resource "aws_instance" "snake_ec2" {
  ami                         = "ami-0c02fb55956c7d316" # Ubuntu 22.04
  instance_type               = "t2.micro"
  key_name                    = aws_key_pair.ssh_key.key_name
  subnet_id                   = aws_subnet.snake_public_subnet.id
  vpc_security_group_ids      = [aws_security_group.snake_sg.id]

  tags = {
    Name = "SnakeGameServer"
  }

  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = "ec2-user"
      private_key = file(var.private_key_path)
      host        = self.public_ip
    }

    
    inline = [
      "sudo yum update -y",
      "sudo yum install -y docker git",
      "sudo systemctl start docker",
      "sudo usermod -aG docker ec2-user",
      "git clone https://github.com/sngawang/infra-api.git /home/ec2-user/app",
      "cd /home/ec2-user/app/snake-web-game",
      "sudo docker build -t snake-game .",
      "sudo docker run -d -p 5000:5000 snake-game"
    ]
  }
}

