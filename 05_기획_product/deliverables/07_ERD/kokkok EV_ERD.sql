CREATE TABLE `payments` (
	`payment_id`	BIGINT	NOT NULL,
	`user_id`	VARCHAR(36)	NULL,
	`charging_fee`	DECIMAL(15,2)	NULL,
	`idle_fee`	DECIMAL(15,2)	NULL,
	`total_amount`	DECIMAL(15,2)	NULL,
	`discount_amount`	DECIMAL(15,2)	NULL,
	`final_paid_amount`	DECIMAL(15,2)	NULL,
	`payment_status`	VARCHAR(20)	NULL,
	`paid_at`	DATETIME	NULL,
	`transaction_id`	INT	NOT NULL
);

CREATE TABLE `chargers` (
	`charge_box_id`	VARCHAR(50)	NOT NULL,
	`model_name`	VARCHAR(100)	NULL,
	`address`	VARCHAR(255)	NULL,
	`latitude`	DECIMAL(10,8)	NULL,
	`longitude`	DECIMAL(11,8)	NULL,
	`status`	VARCHAR(20)	NULL,
	`heartbeat_interval`	INT	NULL	DEFAULT 60,
	`connection_timeout`	INT	NULL	DEFAULT 300,
	`updated_at`	DATETIME	NULL,
	`manufacturer_id`	INT	NOT NULL
);

CREATE TABLE `active_charging_sessions` (
	`session_id`	BIGINT	NOT NULL,
	`transaction_id`	INT	NULL,
	`connector_id`	INT	NULL,
	`user_id`	VARCHAR(36)	NULL,
	`status`	VARCHAR(20)	NULL,
	`reservation_id`	INT	NULL,
	`reservation_expiry`	DATETIME	NULL,
	`start_time`	DATETIME	NULL,
	`meter_start`	DECIMAL(15,2)	NULL,
	`raw_json_log`	JSON	NULL,
	`charge_box_id`	VARCHAR(50)	NOT NULL
);

CREATE TABLE `charging_transactions` (
	`transaction_id`	INT	NOT NULL,
	`connector_id`	INT	NULL,
	`user_id`	VARCHAR(36)	NULL,
	`start_time`	DATETIME	NULL,
	`end_time`	DATETIME	NULL,
	`full_charge_time`	DATETIME	NULL,
	`termination_reason`	VARCHAR(50)	NULL,
	`meter_start`	DECIMAL(15,2)	NULL,
	`meter_stop`	DECIMAL(15,2)	NULL,
	`total_energy_kwh`	DECIMAL(10,2)	NULL,
	`grace_period_check`	BOOLEAN	NULL,
	`billable_idle_min`	INT	NULL,
	`charge_box_id`	VARCHAR(50)	NOT NULL
);

CREATE TABLE `charger_manufacturers` (
	`id`	INT	NOT NULL,
	`vendor_name`	VARCHAR(100)	NULL,
	`company_phone`	VARCHAR(20)	NULL,
	`created_at`	DATETIME	NULL,
	`Field`	VARCHAR(255)	NULL,
	`Field2`	VARCHAR(255)	NULL
);

ALTER TABLE `payments` ADD CONSTRAINT `PK_PAYMENTS` PRIMARY KEY (
	`payment_id`
);

ALTER TABLE `chargers` ADD CONSTRAINT `PK_CHARGERS` PRIMARY KEY (
	`charge_box_id`
);

ALTER TABLE `active_charging_sessions` ADD CONSTRAINT `PK_ACTIVE_CHARGING_SESSIONS` PRIMARY KEY (
	`session_id`
);

ALTER TABLE `charging_transactions` ADD CONSTRAINT `PK_CHARGING_TRANSACTIONS` PRIMARY KEY (
	`transaction_id`
);

ALTER TABLE `charger_manufacturers` ADD CONSTRAINT `PK_CHARGER_MANUFACTURERS` PRIMARY KEY (
	`id`
);

