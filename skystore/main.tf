terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
}

provider "docker" {
  host = "unix:///run/podman/podman.sock"
}

# شبكة النظام الموحدة
resource "docker_network" "skystore_network" {
  name = "skystore-net"
}

# حاوية MariaDB
resource "docker_container" "mariadb" {
  name  = "skystore-mariadb"
  image = "mariadb:11.4"
  networks_advanced {
    name = docker_network.skystore_network.name
  }
  env = [
    "MYSQL_ROOT_PASSWORD=rootpassword",
    "MYSQL_DATABASE=skystore_db",
    "MYSQL_USER=sky_user",
    "MYSQL_PASSWORD=sky_secure_pass"
  ]
  ports {
    internal = 3306
    external = 3306
  }
}

# حاوية PostgreSQL (الخاصة بـ Keycloak)
resource "docker_container" "postgres" {
  name  = "skystore-postgres"
  image = "postgres:16-alpine"
  networks_advanced {
    name = docker_network.skystore_network.name
  }
  env = [
    "POSTGRES_DB=keycloak_db",
    "POSTGRES_USER=keycloak_user",
    "POSTGRES_PASSWORD=keycloak_password"
  ]
  ports {
    internal = 5432
    external = 5432
  }
}

# حاوية Redis
resource "docker_container" "redis" {
  name  = "skystore-redis"
  image = "redis:7-alpine"
  networks_advanced {
    name = docker_network.skystore_network.name
  }
  ports {
    internal = 6379
    external = 6379
  }
}

# حاوية RabbitMQ
resource "docker_container" "rabbitmq" {
  name  = "skystore-rabbitmq"
  image = "rabbitmq:3-management-alpine"
  networks_advanced {
    name = docker_network.skystore_network.name
  }
  env = [
    "RABBITMQ_DEFAULT_USER=sky_admin",
    "RABBITMQ_DEFAULT_PASS=sky_admin_pass"
  ]
  ports {
    internal = 5672
    external = 5672
  }
  ports {
    internal = 15672
    external = 15672
  }
}

# حاوية Keycloak
resource "docker_container" "keycloak" {
  name  = "skystore-keycloak"
  image = "quay.io/keycloak/keycloak:24.0"
  command = ["start-dev"]
  networks_advanced {
    name = docker_network.skystore_network.name
  }
  env = [
    "KC_DB=postgres",
    "KC_DB_URL=jdbc:postgresql://skystore-postgres:5432/keycloak_db",
    "KC_DB_USERNAME=keycloak_user",
    "KC_DB_PASSWORD=keycloak_password",
    "KEYCLOAK_ADMIN=admin",
    "KEYCLOAK_ADMIN_PASSWORD=admin_secure_pass"
  ]
  ports {
    internal = 8080
    external = 8080
  }
  depends_on = [docker_container.postgres]
}
