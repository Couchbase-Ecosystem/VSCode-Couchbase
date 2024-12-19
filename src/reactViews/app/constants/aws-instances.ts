export const AWS_INSTANCES = [
  {
    name: 'm5.xlarge',
    vCpu: 4,
    memory: 16,
  },
  {
    name: 'm5.2xlarge',
    vCpu: 8,
    memory: 32,
  },
  {
    name: 'm5.4xlarge',
    vCpu: 16,
    memory: 64,
  },
  {
    name: 'm5.8xlarge',
    vCpu: 32,
    memory: 128,
  },
  {
    name: 'm5.12xlarge',
    vCpu: 48,
    memory: 192,
  },
  {
    name: 'm5.16xlarge',
    vCpu: 64,
    memory: 256,
  },
  {
    name: 'm5.24xlarge',
    vCpu: 96,
    memory: 384,
  },
  {
    name: 'r5.large',
    vCpu: 2,
    memory: 16,
  },
  {
    name: 'r5.xlarge',
    vCpu: 4,
    memory: 32,
  },
  {
    name: 'r5.2xlarge',
    vCpu: 8,
    memory: 64,
  },
  {
    name: 'r5.4xlarge',
    vCpu: 16,
    memory: 128,
  },
  {
    name: 'r5.8xlarge',
    vCpu: 32,
    memory: 256,
  },
  {
    name: 'r5.12xlarge',
    vCpu: 48,
    memory: 384,
  },
  {
    name: 'r5.24xlarge',
    vCpu: 96,
    memory: 768,
  },
  {
    name: 'c5.large',
    vCpu: 2,
    memory: 4,
  },
  {
    name: 'c5.xlarge',
    vCpu: 4,
    memory: 8,
  },
  {
    name: 'c5.2xlarge',
    vCpu: 8,
    memory: 16,
  },
  {
    name: 'c5.4xlarge',
    vCpu: 16,
    memory: 32,
  },
  {
    name: 'c5.9xlarge',
    vCpu: 36,
    memory: 72,
  },
  {
    name: 'c5.12xlarge',
    vCpu: 48,
    memory: 96,
  },
  {
    name: 'c5.18xlarge',
    vCpu: 72,
    memory: 144,
  },
  {
    name: 'x1.16xlarge',
    vCpu: 64,
    memory: 976,
  },
  {
    name: 'x1.32xlarge',
    vCpu: 128,
    memory: 1952,
  },
] as const;

export type AWSInstance = (typeof AWS_INSTANCES)[number];
export type AWSInstancesName = (typeof AWS_INSTANCES)[number]['name'];
