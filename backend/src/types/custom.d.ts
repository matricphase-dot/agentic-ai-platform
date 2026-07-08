import "@prisma/client";

declare module "@prisma/client" {
  export enum Role {
    USER = "USER",
    ADMIN = "ADMIN"
  }

  export enum AgentCategory {
    CHATBOT = "CHATBOT",
    DATA_ANALYST = "DATA_ANALYST",
    CODE_ASSISTANT = "CODE_ASSISTANT",
    IMAGE_GENERATOR = "IMAGE_GENERATOR",
    RESEARCH = "RESEARCH",
    AUTOMATION = "AUTOMATION",
    CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT",
    FINANCE = "FINANCE",
    LEGAL = "LEGAL",
    OTHER = "OTHER"
  }

  export enum PricingModel {
    FREE = "FREE",
    PER_INVOCATION = "PER_INVOCATION",
    PER_TOKEN = "PER_TOKEN"
  }

  export enum AgentStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    DEPRECATED = "DEPRECATED"
  }

  export enum InvocationStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    TIMEOUT = "TIMEOUT"
  }

  export enum NodeStatus {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
    BUSY = "BUSY",
    MAINTENANCE = "MAINTENANCE"
  }

  export enum TaskStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    TIMEOUT = "TIMEOUT"
  }

  export enum TransactionType {
    TOPUP = "TOPUP",
    INVOCATION_CHARGE = "INVOCATION_CHARGE",
    AGENT_EARNING = "AGENT_EARNING",
    NODE_REWARD = "NODE_REWARD",
    STAKE = "STAKE",
    UNSTAKE = "UNSTAKE",
    REWARD_CLAIM = "REWARD_CLAIM",
    WITHDRAWAL = "WITHDRAWAL",
    PLATFORM_FEE = "PLATFORM_FEE",
    REFUND = "REFUND",
    PAYOUT = "PAYOUT"
  }

  export enum PayoutStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED"
  }

  export enum StakeStatus {
    ACTIVE = "ACTIVE",
    UNSTAKING = "UNSTAKING",
    COMPLETED = "COMPLETED"
  }

  export enum ProposalType {
    FEE_CHANGE = "FEE_CHANGE",
    TREASURY = "TREASURY",
    FEATURE = "FEATURE",
    SLASH = "SLASH",
    OTHER = "OTHER"
  }

  export enum ProposalStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    PASSED = "PASSED",
    REJECTED = "REJECTED",
    EXECUTED = "EXECUTED",
    CANCELLED = "CANCELLED"
  }

  export enum VoteChoice {
    FOR = "FOR",
    AGAINST = "AGAINST",
    ABSTAIN = "ABSTAIN"
  }

  export enum TeamRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
  }

  export enum ReportReason {
    HARMFUL_OUTPUT = "HARMFUL_OUTPUT",
    ILLEGAL_CONTENT = "ILLEGAL_CONTENT",
    DECEPTIVE_PRACTICE = "DECEPTIVE_PRACTICE",
    PRIVACY_VIOLATION = "PRIVACY_VIOLATION",
    MISINFORMATION = "MISINFORMATION",
    SPAM = "SPAM",
    OTHER = "OTHER"
  }

  export enum ReportStatus {
    PENDING = "PENDING",
    UNDER_REVIEW = "UNDER_REVIEW",
    RESOLVED_NO_ACTION = "RESOLVED_NO_ACTION",
    RESOLVED_UNPUBLISHED = "RESOLVED_UNPUBLISHED",
    RESOLVED_WARNING_ISSUED = "RESOLVED_WARNING_ISSUED"
  }
}
