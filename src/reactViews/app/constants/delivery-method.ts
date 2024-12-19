/**
 * Available delivery methods for a database, associated with their display text.
 */
export const DELIVERY_METHOD = {
  hosted: 'Provisioned',
  inVpc: 'In-VPC',
  onPrem: 'On-Prem',
  serverless: 'Serverless',
} as const;

export type DeliveryMethod = keyof typeof DELIVERY_METHOD;
