# [HCMUS][CSC11006] HCMUS_CLOUD-IMPLEMENTATIONS-AND-OPERATIONS Deploying a Highly Available & Scalable E-commerce Platform on AWS

## 1. Project Overview

The project will deploy a multi-tier e-commerce platform (a sample Nodejs e-commerce platform). The focus will be on the infrastructure setup, automation, monitoring, and operational best practices.

## 2. Implementation Details

### 2.1 Network Infrastructure

### 2.1.1 VPC

#### 2.1.1.1 resource aws_vpc

This resource provisions the foundational, logically isolated virtual network.

- cidr_block: 10.0.0.0/16
  - Purpose: Defines the primary private IPv4 address range for the entire VPC.
  - Configuration Rationale: The 10.0.0.0/16 block is a standard choice from the RFC 1918 private address space. It provides a large pool of 65,536 IP addresses, offering ample room for the current multi-tier application and significant future expansion without the risk of IP address exhaustion.
- enable_dns_support = true &
  enable_dns_hostnames = true
  Purpose: These properties control the VPC's DNS resolution capabilities.
  - "enable_dns_support" ensures that the Amazon-provided DNS server can resolve DNS names, while "enable_dns_hostnames" ensures that instances launched into the VPC receive public DNS hostnames.
  - Configuration Rationale: This configuration is critical for modern cloud applications. It allows services to communicate using human-readable DNS names (e.g., the RDS Proxy endpoint) rather than relying on hard-coded IP addresses, which is more robust and maintainable.

#### 2.1.1.2 resource aws_subnet

These resources partition the VPC's IP address space into smaller, manageable segments for resource placement and traffic control.

- count = length(var.public_subnets)
  - Purpose: Dynamically creates a subnet for each entry in the "public_subnets" variable, allowing for flexible scaling and management of subnets across multiple Availability Zones.
  - Configuration Rationale: Using the "count" meta-argument enables the creation of multiple subnets based on the provided list, ensuring that the infrastructure can adapt to different deployment scenarios and Availability Zone distributions.

- vpc_id = aws_vpc.this.id
  - Purpose: Associates the subnet with the parent VPC created above.
  - Configuration Rationale: This is a mandatory association, implemented using the "= aws_vpc.this.id" intrinsic function to dynamically link the subnet to its VPC.

- cidr_block = 10.0.x.0/24
  - Purpose: Defines the specific IP address range for each subnet.
  - Configuration Rationale: Each subnet is allocated a /24 block, providing 256 IP addresses (of which 251 are usable). This is a standard size, sufficient for the resources within each tier and Availability Zone. Each subnet has a unique range to prevent IP conflicts.
- availability_zone = var.public_subnets[count.index].availability_zone
  - Purpose: Specifies the physical AWS data center (e.g., ap-southeast-1a) where the subnet resides.
  - Configuration Rationale: The architecture deliberately places subnets across two Availability Zones (ap-southeast-1a, ap-southeast-1b). This multi-AZ design is a foundational best practice for building highly available and fault-tolerant systems. If one AZ experiences an outage, resources in the other AZ can continue to operate.
- map_public_ip_on_launch = true
  - Purpose: Determines if an EC2 instance launched into the subnet automatically receives a public IP address.
  - Configuration Rationale: This property is the primary differentiator between public and private subnets. It is set to true for public subnets to allow resources like the Application Load Balancer to be directly accessible from the internet. It is set to false for private subnets to protect backend resources (Database, Cache) from direct external exposure, a core security principle

#### 2.1.1.3 resource aws_internet_gateway

These resources provide a path for internet-bound traffic from the public subnets.

#### 2.1.1.4 resource aws_route_table

- route {
  cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.this.id
  }
  - Purpose: Creates a specific traffic routing rule within a route table.
  - Configuration Rationale: The "0.0.0.0/0" CIDR block represents all IP addresses, and the gateway_id directs traffic to the internet gateway.

#### 2.1.1.5 resource aws_route_table_association

- Purpose: Links the route table to the public subnets, ensuring that instances within those subnets can route traffic to the internet.
- Configuration Rationale: This association is essential for enabling internet access for resources in the public subnets, such as the Application Load Balancer.

#### 2.1.1.6 resource aws_security_group

- Purpose: Defines a security group that acts as a virtual firewall for controlling inbound to cache using only tcp protocol on port 6379

### 2.1.2 Network Access Control Lists (NACLs)

Resource Definitions (Public NACL, Private NACL)

- Purpose: act as a stateless, subnet-level firewall that provides a broader, secondary layer of defense.
- Configuration Rationale: Two distinct NACLs are created because public and private subnets have fundamentally different traffic requirements.

NACL Rules (Inbound & Outbound Rules)

- protocol: Defines the type of traffic the rule applies to, such as TCP, UDP, or ICMP.
- rule_no: Determines the order of rule evaluation, from lowest to highest. The numbering scheme (100, 110, 120) allows for future insertion of rules without renumbering.
- action: Specifies whether to allow or deny traffic that matches the rule criteria. "allow" permits the traffic, while "deny" blocks it.
- ingress/egress: Specifies whether the rule applies to inbound (ingress) or outbound (egress) traffic.

### 2.2 E-commerce Application Hosting (Amazon EC2, ELB, Auto Scaling)

#### 2.2.1 Load balancing Infrastructure

The template first defines the infrastructure responsible for receiving user traffic and distributing it across the application servers.

##### 2.2.1.1 aws_lb_target_group

- Purpose: Defines target groups (frontend and backend) that contains the EC2 instances running the e-commerce application. The load balancer uses this group to route incoming requests.
- Configuration Rationale: The target group is configured to use the HTTP protocol on port 80 (frontend) and port 3000 (backend). Health checks are set up to monitor the health of the instances, ensuring that traffic is only sent to healthy instances.

##### 2.2.1.2 aws_lb

- Purpose: Creates an Application Load Balancer (ALB) that serves as the entry point for user traffic. It distributes incoming requests to the target groups based on the defined listener rules.
- Configuration Rationale: The ALB is configured to listen on port 80 (HTTP) and route traffic to the frontend target group. It is associated with the public subnets, allowing it to be accessible from the internet. The ALB also supports features like SSL termination, sticky sessions, and advanced routing capabilities, which are essential for modern web applications.

#### 2.2.2 Compute and application deployment

##### 2.2.2.1 aws_launch_template

This resource serves as a standardized blueprint for creating every application server, ensuring consistency across the fleet. Key configurations within its include:

- network_interfaces: Specifies the network interface configuration for the EC2 instances, including the security group and subnet association.
- iam_instance_profile: Associates the EC2 instances with an IAM role, granting them the necessary permissions to interact with other AWS services (e.g., S3 for storage).
- user_data: Contains a script that runs during the instance's initialization. This script typically installs necessary software, configures the application, and starts the application server.

##### 2.2.2.2 Auto Scaling group

This resource manages the lifecycle of the EC2 instances

- Configuration: It is configured to use the launch_template as its blueprint. It maintains a fleet of 2 to 4 instances, starting with a desired capacity of 2.

- High Availability & Integration: The group is configured to launch instances across both public subnets, ensuring the application tier is resilient to an Availability Zone failure. It is also linked to the TargetGroup, ensuring that any new instance it launches is automatically registered with the ALB to receive traffic.

### 2.3 Database Tier (Amazon Aurora & RDS Proxy)

The purpose of this template is to provision the entire data persistence and connection management layer for the project. It defines a highly available Aurora PostgreSQL database
Implementation Details 11
cluster, a connection pooling mechanism via RDS Proxy, and the necessary components for secure credential management.

#### 2.3.1 Networking and Security Prerequisites

The database layer is deployed into the secure, isolated environment established by the VPC and private subnets. This ensures that the database is not directly accessible from the internet, enhancing security.

- aws_db_subnet_group: This resource defines a group of subnets specifically for the database instances. By placing the database in private subnets, this is a critical security measure, ensuring that the database is completely isolated from the public internet. Deploying across two Availability Zones provides the foundation for Multi-AZ high availability.

### 2.3.2 Secure Credential Management

- aws_secretsmanager_secret: To securely store, manage, and rotate the master database credentials (username and password). This practice decouples sensitive information from the infrastructure definition, significantly enhancing the security posture

### 2.3.3 Amazon Aurora PostgreSQL Cluster

This collection of resources creates the highly available core database for the application.

#### 2.3.3.1 aws_rds_cluster

- Purpose: Defines the Aurora PostgreSQL cluster, which serves as the primary data store for the e-commerce application. It is configured for high availability across multiple Availability Zones.

- Configuration Details:
  - engine: Specifies the database engine as "aurora-postgresql" with a specific version (e.g., 18.4). This ensures compatibility with the application's requirements and leverages the latest features and security patches.
  - master_username & master_password: These credentials are securely retrieved from AWS Secrets Manager
  - Networking: The cluster is associated with the private subnets and the database security group, which only allowing connections from the RDS Proxy.

#### 2.3.3.2 aws_rds_cluster_instance

- Purpose: Defines individual instances within the Aurora cluster. Writer instance is the primary node that handles write operations, while reader instances handle read operations, allowing for horizontal scaling of read traffic.

### 2.3.4 RDS Proxy

#### 2.3.4.1 proxy_role (IAM role)

- Purpose: Creates a secure identity for the RDS Proxy service.
- Configuration: The role's trust policy allows the rds.amazonaws.com service to assume it. The attached permissions policy follows the principle of least privilege, granting the proxy only one permission: the ability to retrieve the database password from the specific db_secret created earlier

#### 2.3.4.2 aws_db_proxy

- Purpose: Establishes the RDS Proxy, which acts as an intermediary between the application and the Aurora database. It manages connection pooling, reducing the overhead of establishing new connections and improving application performance.
- Configuration: The proxy is associated with the database security group and the private subnets. It is configured to use the IAM role created earlier for secure credential retrieval. The proxy's endpoint is used by the application to connect to the database, abstracting the underlying database instances and providing a single connection point.

### 2.4 Database Caching Layer

#### 2.4.1 aws_elasticache_subnet_group

This resource is a mandatory prerequisite for creating an ElastiCache cluster within a VPC. It defines a named collection of subnets where cache nodes can be placed.

- subnet_ids: Specifies the private subnets where the ElastiCache nodes will be deployed. Placing the cache exclusively in private subnets is a fundamental security best practice, preventing any direct exposure to the public internet. Utilizing subnets from two different Availability Zones provides the necessary network foundation for a Multi-AZ, high-availability deployment, should it be required in the future.

#### 2.4.2 aws_elasticache_replication_group

This is the central resource of the template, responsible for provisioning the Valkey cache cluster.
The replication group resource type is utilized as it is the modern and flexible standard for defining ElastiCache clusters, even for single-node configurations

- engine: valkey & engine_version: 8.0
  - Purpose: These properties specify the caching software and its version.
  - Configuration Rationale: valkey is selected as the desired open-source, Redis- compatible engine. The version is explicitly set to 8.0 to ensure a deterministic and consistent environment across all deployments, preventing unexpected behavior that could arise from AWS changing its default version over time.
- node_type: "cache.t3.micro"
- parameter_group_name: "default.valkey8"
  - Purpose: Specifies the set of engine configuration parameters for the cluster.
  - Configuration Rationale: This configuration uses the standard, AWS-managed parameter group for Valkey 8.0. This group contains settings that are pre-optimized for general-purpose workloads and are sufficient for the needs of this project without requiring manual tuning

## 3. Test Result

## 5. Project Structure

```text
.
├── src/
│   ├── backend/         # Node.js API with Prisma
│   └── frontend/        # React Application
├── terraform/
│   └── aws/
│       ├── modules/
│       │   ├── vpc/      # Networking & Security
│       │   ├── database/ # Aurora & RDS Proxy
│       │   ├── cache/    # ElastiCache
│       │   └── compute/  # ALB, ASG & Launch Template
│       └── main.tf       # Root configuration
└── README.md
```
