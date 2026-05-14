-- CreateEnum
CREATE TYPE "ThreatType" AS ENUM ('phishing', 'port_scan', 'unauthorized_access', 'ddos', 'malware', 'brute_force', 'sql_injection', 'xss', 'data_exfiltration', 'ransomware');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('new', 'acknowledged', 'investigating', 'resolved', 'false_positive');

-- CreateEnum
CREATE TYPE "SensorType" AS ENUM ('network_ids', 'host_ids', 'firewall', 'waf', 'endpoint', 'email_gateway');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'analyst');

-- CreateTable
CREATE TABLE "alerts" (
    "id" SERIAL NOT NULL,
    "alert_id" TEXT NOT NULL,
    "threat_type" "ThreatType" NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'new',
    "sensor_type" "SensorType" NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "source_ip" TEXT NOT NULL,
    "destination_ip" TEXT NOT NULL,
    "source_port" INTEGER,
    "destination_port" INTEGER,
    "protocol" TEXT NOT NULL DEFAULT 'TCP',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "raw_log" TEXT,
    "affected_asset" TEXT,
    "mitre_tactic" TEXT,
    "mitre_technique" TEXT,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_stats" (
    "id" SERIAL NOT NULL,
    "period" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "total_alerts" INTEGER NOT NULL DEFAULT 0,
    "critical_count" INTEGER NOT NULL DEFAULT 0,
    "high_count" INTEGER NOT NULL DEFAULT 0,
    "medium_count" INTEGER NOT NULL DEFAULT 0,
    "low_count" INTEGER NOT NULL DEFAULT 0,
    "top_threat_type" TEXT,
    "top_source_ip" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'analyst',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "alert_id" TEXT,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alerts_alert_id_key" ON "alerts"("alert_id");

-- CreateIndex
CREATE INDEX "alerts_threat_type_idx" ON "alerts"("threat_type");

-- CreateIndex
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");

-- CreateIndex
CREATE INDEX "alerts_status_idx" ON "alerts"("status");

-- CreateIndex
CREATE INDEX "alerts_timestamp_idx" ON "alerts"("timestamp");

-- CreateIndex
CREATE INDEX "alerts_source_ip_idx" ON "alerts"("source_ip");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_stats_period_period_start_key" ON "dashboard_stats"("period", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_alert_id_idx" ON "audit_logs"("alert_id");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
