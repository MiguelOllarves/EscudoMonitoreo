"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertQueryDto = exports.UpdateAlertStatusDto = exports.IngestAlertDto = exports.SensorType = exports.AlertStatus = exports.SeverityLevel = exports.ThreatType = void 0;
const class_validator_1 = require("class-validator");
var ThreatType;
(function (ThreatType) {
    ThreatType["PHISHING"] = "phishing";
    ThreatType["PORT_SCAN"] = "port_scan";
    ThreatType["UNAUTHORIZED_ACCESS"] = "unauthorized_access";
    ThreatType["DDOS"] = "ddos";
    ThreatType["MALWARE"] = "malware";
    ThreatType["BRUTE_FORCE"] = "brute_force";
    ThreatType["SQL_INJECTION"] = "sql_injection";
    ThreatType["XSS"] = "xss";
    ThreatType["DATA_EXFILTRATION"] = "data_exfiltration";
    ThreatType["RANSOMWARE"] = "ransomware";
})(ThreatType || (exports.ThreatType = ThreatType = {}));
var SeverityLevel;
(function (SeverityLevel) {
    SeverityLevel["LOW"] = "low";
    SeverityLevel["MEDIUM"] = "medium";
    SeverityLevel["HIGH"] = "high";
    SeverityLevel["CRITICAL"] = "critical";
})(SeverityLevel || (exports.SeverityLevel = SeverityLevel = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["NEW"] = "new";
    AlertStatus["ACKNOWLEDGED"] = "acknowledged";
    AlertStatus["INVESTIGATING"] = "investigating";
    AlertStatus["RESOLVED"] = "resolved";
    AlertStatus["FALSE_POSITIVE"] = "false_positive";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var SensorType;
(function (SensorType) {
    SensorType["NETWORK_IDS"] = "network_ids";
    SensorType["HOST_IDS"] = "host_ids";
    SensorType["FIREWALL"] = "firewall";
    SensorType["WAF"] = "waf";
    SensorType["ENDPOINT"] = "endpoint";
    SensorType["EMAIL_GATEWAY"] = "email_gateway";
})(SensorType || (exports.SensorType = SensorType = {}));
class IngestAlertDto {
    alert_id;
    threat_type;
    severity;
    status;
    sensor_type;
    sensor_id;
    source_ip;
    destination_ip;
    source_port;
    destination_port;
    protocol;
    title;
    description;
    raw_log;
    affected_asset;
    mitre_tactic;
    mitre_technique;
    confidence_score;
    timestamp;
}
exports.IngestAlertDto = IngestAlertDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "alert_id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ThreatType),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "threat_type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SeverityLevel),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AlertStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SensorType),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "sensor_type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "sensor_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "source_ip", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "destination_ip", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], IngestAlertDto.prototype, "source_port", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], IngestAlertDto.prototype, "destination_port", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "protocol", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "raw_log", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "affected_asset", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "mitre_tactic", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "mitre_technique", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], IngestAlertDto.prototype, "confidence_score", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestAlertDto.prototype, "timestamp", void 0);
class UpdateAlertStatusDto {
    status;
}
exports.UpdateAlertStatusDto = UpdateAlertStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(AlertStatus),
    __metadata("design:type", String)
], UpdateAlertStatusDto.prototype, "status", void 0);
class AlertQueryDto {
    threatType;
    severity;
    status;
    limit;
    offset;
}
exports.AlertQueryDto = AlertQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ThreatType),
    __metadata("design:type", String)
], AlertQueryDto.prototype, "threatType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SeverityLevel),
    __metadata("design:type", String)
], AlertQueryDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AlertStatus),
    __metadata("design:type", String)
], AlertQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AlertQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AlertQueryDto.prototype, "offset", void 0);
//# sourceMappingURL=alert.dto.js.map