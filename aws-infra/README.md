# 📦 Terraform Infrastructure Guide

This guide walks you through setting up and deploying the AWS infrastructure for the Flask-based Snake web game using Terraform.

---

## ✅ Prerequisites

* An AWS account with IAM user credentials
* AWS CLI installed and configured
* Terraform installed
* SSH key pair generated (without a passphrase)

---

## 🔐 1. Generate SSH Key Pair (if not done already)

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/snake-key -N ""
chmod 400 ~/.ssh/snake-key
```

This creates:

* `~/.ssh/snake-key` (private key)
* `~/.ssh/snake-key.pub` (public key)

---

## 🛠️ 2. Configure AWS CLI

```bash
aws configure
```

Enter your:

* AWS Access Key ID
* AWS Secret Access Key
* Default region (e.g. `us-east-1`)
* Output format (you can leave as `json`)

---

## 📁 3. Navigate to Terraform Folder

```bash
cd aws-infra
```

---

## 📦 4. Initialize Terraform

```bash
terraform init
```

This sets up the working directory and downloads required providers.

---

## 🚀 5. Deploy Infrastructure

```bash
terraform apply \
  -var="public_key_path=~/.ssh/snake-key.pub" \
  -var="private_key_path=~/.ssh/snake-key"
```

Type `yes` to confirm. Terraform will:

* Create a custom VPC with subnet
* Launch an EC2 instance
* Install Docker
* Clone your Snake game repo
* Build and run your Flask app in a Docker container

---

## 🌐 6. Access the Web App

Terraform will output an EC2 public IP. Open in your browser:

```
http://<public-ip>:5000
```

---

## 🧼 7. Destroy the Infrastructure

To tear everything down:

```bash
terraform destroy \
  -var="public_key_path=~/.ssh/snake-key.pub" \
  -var="private_key_path=~/.ssh/snake-key"
```

---

## 📋 Notes

* The `main.tf` file provisions a VPC, security group, public subnet, internet gateway, route table, EC2 instance, and Docker app.
* Logs and state files like `terraform.tfstate` should be excluded from Git using `.gitignore`.
