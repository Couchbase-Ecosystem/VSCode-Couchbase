/*
 *     Copyright 2011-2020 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
const pkg = require('../../package.json');
export class Constants {
  public static extensionID = "vscode-couchbase";
  public static connectionKeys = "cluster.connections";
  public static QUERY_HISTORY = "cluster.queryHistory";
  public static FAVORITE_QUERY = "cluster.favoriteQueries";
  public static ACTIVE_CONNECTION = "activeConnection";
  public static FAVORITE_QUERIES_WEBVIEW = "favoriteQueriesWebview";
  public static CLUSTER_OVERVIEW_WEBVIEW = "clusterOverviewWebview";
  public static CLUSTER_OVERVIEW_DATA = "clusterOverviewData";
  public static QUERY_CONTEXT_STATUS_BAR = "queryContextStatusBar";
  public static IQ_USER_ID = "iqUserId";
  public static IQ_PASSWORD = "iqPassword";
  public static IQ_WEBVIEW = "iqWebview";
  public static notebookType = "couchbase-query-notebook";
  public static capellaUrlPostfix = "cloud.couchbase.com";
  public static prefixSecureURL = "couchbases://";
  public static prefixURL = "couchbase://";
  public static extensionVersion = pkg.version;
  public static COUCHBASEVERSIONKEY = "Couchbase Version";
  public static STATUS = "Status";
  public static SERVICES= "Services";
  public static NODES= "Nodes";
  public static BUCKETS= "Buckets";
  public static OS= "OS";
  public static DATA="Data";
  public static EVENTING="Eventing";
  public static INDEX="Index";
  public static SEARCH="Search";
  public static ANALYTICS="Analytics";
  public static TOTAL="Total";
  public static USED="Used";
  public static QUOTA_TOTAL="Quota Total";
  public static QUOTA_USED="Quota Used";
  public static QUOTA_USED_PER_NODE="Quota Used per Node";
  public static QUOTA_TOTAL_PER_NODE="Quota Total per Node";
  public static USED_BY_DATA="Used by Data";
  public static FREE="Free";
  public static TYPE="Type";
  public static STORAGE_BACKEND="Storage Backend";
  public static REPLICAS="Replicas";
  public static EVICTION_POLICY="Eviction Policy";
  public static DURABILITY_LEVEL="Durability Level";
  public static MAX_TTL="Max TTL";
  public static COMPRESSION_MODE="Compression Mode";
  public static CONFLICT_RESOLUTION="Conflict Resolution";
  public static RAM="RAM";
  public static RAW_RAM="Raw RAM";
  public static OPS_PER_SEC="Ops per Sec";
  public static DISK_FETCHES="Disk Fetches";
  public static DISK_USED="Disk Used";
  public static ITEM_COUNT="Item Count";
  public static MEMORY_USED="Memory Used";
  public static NUM_ACTIVE_VBUCKET_NR="# Active vBukcet Non Residents";
  public static DATA_USED="Data Used";
  public static MEMBERSHIP = "Membership";
  public static HOSTNAME = "Hostname";
  public static NODE_ENCRYPTION = "Node Encryption";
  public static UPTIME = "Up Time";
  public static TOTAL_MEMORY = "Total Memory";
  public static FREE_MEMORY = "Free Memory";
  public static RESERVED_MCDMEMORY = "Reserved MCD Memory";
  public static ALLOCATED_MCDMEMORY = "Allocated MCD Memory";
  public static CPUS = "CPUs";
  public static CPU_UTILIZATION_RATE = "CPU Utilization Rate";
  public static SWAP_TOTAL = "Swap Total";
  public static MEMORY_LIMIT = "Memory Limit";
  public static CPUS_TOLERATE = "CPU Stole Rate";
  public static SWAP_USED = "Swap Used";
  public static CORES_AVAILABLE = "Cores Available";
  public static CPU_STOLE_RATE = "CPU Stole Rate";
  public static BUCKET_CACHE_EXPIRY_DURATION = 3 * 24 * 60;
  public static COLLECTION_CACHE_EXPIRY_DURATION = 24 * 60;
  public static DOCUMENTS_DATA_SIZE = "Documents Data Size";
  public static DOCUMENTS_DATA_SIZE_ON_DISK = "Documents Data Size on Disk";
  public static SPATIAL_DATA_SIZE = "Spatial Data Size";
  public static SPATIAL_DATA_SIZE_ON_DISK = "Spatial Data Size on Disk";
  public static VIEWS_DATA_SIZE = "Views Data Size";
  public static VIEWS_DATA_SIZE_ON_DISK = "Views Data Size on Disk";
  public static ITEMS = "Items";
  public static TOTAL_ITEMS = "Total Items";
  public static EP_BG_FETCHED = "Ep. Bg. Fetched";
  public static HITS = "Hits";
  public static INDEX_DATA_SIZE = "Index Data Size";
  public static INDEX_DATA_SIZE_ON_DISK = "Index Data Size on Disk";
  public static INFER_SAMPLE_SIZE = 2000;
  public static OPS = "Ops";
  public static CURRENT_VBUCKET_REPLICA_ITEMS = "Current vBucket Replica Items";
  public static QUERY_RESULT = "Couchbase Query Result";
  public static DATA_EXPORT_WEBVIEW = "dataExportWebview";
  public static DATA_MIGRATE_MDB_WEBVIEW = "dataMdbMigrateWebview";
  public static DATA_IMPORT_WEBVIEW = "dataImportWebview";
}
