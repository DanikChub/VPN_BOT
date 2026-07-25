'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
    CREATE TYPE enum_admin_role AS ENUM (
        'superadmin',
        'admin',
        'support'
    );
`);

    await queryInterface.sequelize.query(`
    CREATE TYPE enum_admin_status AS ENUM (
        'active',
        'blocked'
    );
`);

    await queryInterface.sequelize.query(`
    CREATE TYPE enum_balance_transaction_type AS ENUM (
        'deposit',
        'bonus',
        'subscription_charge',
        'refund',
        'manual_adjustment'
    );
`);

    await queryInterface.sequelize.query(`
    CREATE TYPE enum_order_status AS ENUM (
        'pending',
        'paid',
        'cancelled',
        'expired'
    );
`);

    await queryInterface.sequelize.query(`
    CREATE TYPE enum_payment_status AS ENUM (
        'pending',
        'paid',
        'failed',
        'cancelled',
        'expired'
    );
`);

    await queryInterface.sequelize.query(`
    CREATE TYPE enum_subscription_status AS ENUM (
        'active',
        'expired',
        'blocked'
    );
`);

    await queryInterface.sequelize.query(`
    CREATE TYPE enum_vpn_node_status AS ENUM (
        'online',
        'offline'
    );
`);

    await queryInterface.sequelize.query(`
    CREATE TYPE enum_install_status AS ENUM (
        'pending',
        'installing',
        'waiting_agent',
        'ready',
        'failed'
    );
`);

    await queryInterface.createTable("admins", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      role: {
        type: "enum_admin_role",
        allowNull: false,
        defaultValue: "admin",
      },

      status: {
        type: "enum_admin_status",
        allowNull: false,
        defaultValue: "active",
      },

      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("admins", ["email"], {
      unique: true,
      name: "admins_email_unique",
    });

    await queryInterface.addIndex("admins", ["role"]);

    await queryInterface.addIndex("admins", ["status"]);

    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      telegram_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
      },

      balance_amount: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },

      username: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      first_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
        "users",
        ["telegram_id"],
        {
          unique: true,
          name: "users_telegram_id_unique",
        }
    );

    await queryInterface.createTable("payment_methods", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
        "payment_methods",
        ["code"],
        {
          unique: true,
          name: "payment_methods_code_unique",
        }
    );

    await queryInterface.addIndex(
        "payment_methods",
        ["is_active"]
    );

    await queryInterface.createTable("plans", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      duration_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      price_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
        "plans",
        ["is_active"]
    );

    await queryInterface.createTable("subscriptions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      status: {
        type: "enum_subscription_status",
        allowNull: false,
        defaultValue: "active",
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
        "subscriptions",
        ["user_id"],
        {
          unique: true,
          name: "subscriptions_user_unique",
        }
    );

    await queryInterface.createTable("vpn_credentials", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },

      subscription_token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });

    await queryInterface.addIndex(
        "vpn_credentials",
        ["user_id"],
        {
          unique: true,
          name: "vpn_credentials_user_unique",
        }
    );

    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      plan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "plans",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },

      duration_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      plan_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      status: {
        type: "enum_order_status",
        allowNull: false,
        defaultValue: "pending",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("orders", ["user_id"]);
    await queryInterface.addIndex("orders", ["plan_id"]);
    await queryInterface.addIndex("orders", ["status"]);

    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "orders",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      payment_method_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "payment_methods",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      provider_payment_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      payment_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },

      status: {
        type: "enum_payment_status",
        allowNull: false,
        defaultValue: "pending",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("payments", ["order_id"]);
    await queryInterface.addIndex("payments", ["payment_method_id"]);
    await queryInterface.addIndex("payments", ["status"]);

    await queryInterface.createTable("balance_transactions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      amount: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      type: {
        type: "enum_balance_transaction_type",
        allowNull: false,
      },

      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      idempotency_key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
        "balance_transactions",
        ["user_id"]
    );

    await queryInterface.addIndex(
        "balance_transactions",
        ["idempotency_key"],
        {
          unique: true,
        }
    );

    await queryInterface.createTable("vpn_nodes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      host: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      port: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 443,
      },

      reality_public_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      reality_server_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      reality_short_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      inbound_tag: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "vless-reality-in",
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      status: {
        type: "enum_vpn_node_status",
        allowNull: false,
        defaultValue: "offline",
      },

      last_seen_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      cpu_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      cpu_model: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      memory_total: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },

      memory_used: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },

      uptime_seconds: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },

      install_status: {
        type: "enum_install_status",
        allowNull: false,
        defaultValue: "pending",
      },

      agent_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      ssh_port: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 22,
      },

      ssh_user: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "root",
      },
    });

    await queryInterface.addIndex("vpn_nodes", ["status"]);

    await queryInterface.addIndex("vpn_nodes", ["is_active"]);

    await queryInterface.addIndex(
        "vpn_nodes",
        ["agent_token"],
        {
          unique: true,
          where: {
            agent_token: {
              [Sequelize.Op.ne]: null,
            },
          },
        }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("vpn_nodes");
    await queryInterface.dropTable("balance_transactions");
    await queryInterface.dropTable("payments");
    await queryInterface.dropTable("orders");
    await queryInterface.dropTable("vpn_credentials");
    await queryInterface.dropTable("subscriptions");
    await queryInterface.dropTable("plans");
    await queryInterface.dropTable("payment_methods");
    await queryInterface.dropTable("users");
    await queryInterface.dropTable("admins");

    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_install_status;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_vpn_node_status;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_subscription_status;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_payment_status;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_order_status;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_balance_transaction_type;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_admin_status;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_admin_role;");
  }
};
