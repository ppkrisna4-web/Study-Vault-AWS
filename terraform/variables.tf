variable "aws_region" {
  description = "Región de AWS donde se desplegará la infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "study-vault"
}

variable "environment" {
  description = "Ambiente de despliegue"
  type        = string
  default     = "dev"
}