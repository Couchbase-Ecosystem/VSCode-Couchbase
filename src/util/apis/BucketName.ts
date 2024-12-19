export class BucketName {
    private bucketName: string = '';
    private uuid: string = '';
  
    public getBucketName(): string {
      return this.bucketName;
    }
  
    public setBucketName(bucketName: string): void {
      this.bucketName = bucketName;
    }
  
    public getUuid(): string {
      return this.uuid;
    }
  
    public setUuid(uuid: string): void {
      this.uuid = uuid;
    }
}