import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface TableStat {
  name: string;
  rows: number;
}

interface DatabaseStats {
  contacts: number;
  blogPosts: number;
  portfolioImages: number;
  emailTemplates: number;
  emailSequences: number;
  analytics: number;
  tables: TableStat[];
  totalTables: number;
  totalRows: number;
  totalSize: number | null;
  lastBackup?: string | null;
}

interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  fileSize: number | null;
  timestamp: string;
}

interface TableRows {
  table: string;
  total: number;
  limit: number;
  offset: number;
  columns: string[];
  rows: Record<string, unknown>[];
}

const PAGE_SIZE = 25;

const AdminDatabase: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupNote, setBackupNote] = useState<string | null>(null);
  const [tableFilter, setTableFilter] = useState('');
  const [openTable, setOpenTable] = useState<string | null>(null);
  const [tableRows, setTableRows] = useState<TableRows | null>(null);
  const [rowsLoading, setRowsLoading] = useState(false);

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const authHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchDatabaseInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, healthResponse] = await Promise.all([
        fetch('/api/v1/admin/database/stats', { headers: authHeaders() }),
        fetch('/api/v1/admin/health', { headers: authHeaders() })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        if (healthData.success) {
          setHealth(healthData.health);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchTableRows = async (table: string, offset: number) => {
    try {
      setRowsLoading(true);
      const response = await fetch(
        `/api/v1/admin/database/tables/${encodeURIComponent(table)}/rows?limit=${PAGE_SIZE}&offset=${offset}`,
        { headers: authHeaders() }
      );
      if (!response.ok) {
        throw new Error('Failed to load table rows');
      }
      const data = await response.json();
      if (data.success) {
        setTableRows(data.data);
        setOpenTable(table);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load table rows');
    } finally {
      setRowsLoading(false);
    }
  };

  const downloadSqlDump = async (filename: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('/api/v1/admin/export/database?format=sql', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error('Export failed');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const createBackup = async () => {
    try {
      setIsBackingUp(true);
      setBackupNote(null);
      setError(null);
      const stamp = new Date().toISOString().slice(0, 10);
      await downloadSqlDump(`jeffhonforloco_db_backup_${stamp}.sql`);
      setBackupNote(`Backup downloaded just now (${stamp}).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backup failed');
    } finally {
      setIsBackingUp(false);
    }
  };

  const exportDatabase = async () => {
    try {
      setError(null);
      await downloadSqlDump('database_export.sql');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const getHealthStatus = () => {
    if (!health) return { status: 'unknown', color: 'text-gray-500', icon: Clock };

    switch (health.status) {
      case 'healthy':
        return { status: 'Healthy', color: 'text-green-500', icon: CheckCircle };
      case 'warning':
        return { status: 'Warning', color: 'text-yellow-500', icon: AlertTriangle };
      case 'error':
        return { status: 'Error', color: 'text-red-500', icon: AlertTriangle };
      default:
        return { status: 'Unknown', color: 'text-gray-500', icon: Clock };
    }
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (bytes === null || bytes === undefined) return 'Not reported';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderCell = (value: unknown) => {
    if (value === null || value === undefined) return <span className="text-gray-400 italic">null</span>;
    const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return text.length > 80 ? text.slice(0, 80) + '…' : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading database information...</span>
      </div>
    );
  }

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;
  const tables = stats?.tables ?? [];
  const filteredTables = tables.filter(t =>
    t.name.toLowerCase().includes(tableFilter.toLowerCase())
  );
  const totalPages = tableRows ? Math.max(1, Math.ceil(tableRows.total / tableRows.limit)) : 1;
  const currentPage = tableRows ? Math.floor(tableRows.offset / tableRows.limit) + 1 : 1;

  const keyStats = [
    { label: 'Contacts', value: stats?.contacts ?? 0, hint: 'Contact records' },
    { label: 'Blog Posts', value: stats?.blogPosts ?? 0, hint: 'Blog post records' },
    { label: 'Portfolio Images', value: stats?.portfolioImages ?? 0, hint: 'Portfolio records' },
    { label: 'Email Templates', value: stats?.emailTemplates ?? 0, hint: 'Email template records' },
    { label: 'Email Sequences', value: stats?.emailSequences ?? 0, hint: 'Email sequence records' },
    { label: 'Analytics', value: stats?.analytics ?? 0, hint: 'Analytics records' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Management</h1>
          <p className="text-muted-foreground">Monitor and manage your database</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchDatabaseInfo} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={createBackup} disabled={isBackingUp}>
            <Download className="h-4 w-4 mr-2" />
            {isBackingUp ? 'Backing up...' : 'Create Backup'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {backupNote && (
        <Card className="border-green-200">
          <CardContent className="pt-4">
            <p className="text-sm text-green-700">{backupNote}</p>
          </CardContent>
        </Card>
      )}

      {/* Database Health */}
      <Card>
        <CardHeader>
          <CardTitle>Database Health</CardTitle>
          <CardDescription>
            Current database status and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HealthIcon className={`h-6 w-6 ${healthStatus.color}`} />
              <div>
                <p className="font-medium">Status: {healthStatus.status}</p>
                <p className="text-sm text-gray-500">
                  {health?.message || 'Database is running normally'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Storage Size</p>
              <p className="font-medium" title="Cloudflare D1 does not expose storage size over SQL">
                {formatFileSize(health?.fileSize)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <TableIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTables ?? tables.length}</div>
            <p className="text-xs text-muted-foreground">Tables in the database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRows ?? 0}</div>
            <p className="text-xs text-muted-foreground">Rows across all tables</p>
          </CardContent>
        </Card>
      </div>

      {/* Key table Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {keyStats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All tables */}
      <Card>
        <CardHeader>
          <CardTitle>All Tables</CardTitle>
          <CardDescription>
            Every table in the database with live row counts. Click a table to browse its rows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Filter tables..."
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="max-w-sm"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTables.map((t) => (
              <button
                key={t.name}
                onClick={() => (openTable === t.name ? (setOpenTable(null), setTableRows(null)) : fetchTableRows(t.name, 0))}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent ${openTable === t.name ? 'border-primary' : ''}`}
              >
                <span className="font-mono text-sm font-medium truncate">{t.name}</span>
                <Badge variant="secondary">{t.rows.toLocaleString()} rows</Badge>
              </button>
            ))}
          </div>
          {filteredTables.length === 0 && (
            <p className="text-sm text-muted-foreground">No tables match this filter.</p>
          )}

          {openTable && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-semibold">{openTable}</p>
                <div className="flex items-center space-x-2">
                  {tableRows && (
                    <span className="text-xs text-muted-foreground">
                      Page {currentPage} of {totalPages} · {tableRows.total.toLocaleString()} rows
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!tableRows || tableRows.offset === 0 || rowsLoading}
                    onClick={() => fetchTableRows(openTable, Math.max(0, (tableRows?.offset ?? 0) - PAGE_SIZE))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!tableRows || currentPage >= totalPages || rowsLoading}
                    onClick={() => fetchTableRows(openTable, (tableRows?.offset ?? 0) + PAGE_SIZE)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setOpenTable(null); setTableRows(null); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {rowsLoading && <p className="text-sm text-muted-foreground">Loading rows...</p>}
              {!rowsLoading && tableRows && tableRows.rows.length === 0 && (
                <p className="text-sm text-muted-foreground">This table has no rows yet.</p>
              )}
              {!rowsLoading && tableRows && tableRows.rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-left">
                        {tableRows.columns.map((col) => (
                          <th key={col} className="px-2 py-2 font-mono font-semibold whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.rows.map((row, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-accent/50">
                          {tableRows.columns.map((col) => (
                            <td key={col} className="px-2 py-2 font-mono whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis">
                              {renderCell(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
            <CardDescription>
              Manage database backups and restores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Last Backup</p>
                <p className="text-sm text-gray-500">
                  {stats?.lastBackup ? new Date(stats.lastBackup).toLocaleString() : 'On-demand download'}
                </p>
              </div>
              <Button onClick={createBackup} disabled={isBackingUp}>
                <Download className="h-4 w-4 mr-2" />
                {isBackingUp ? 'Preparing...' : 'Create Backup'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Database</p>
                <p className="text-sm text-gray-500">Download SQL dump</p>
              </div>
              <Button onClick={exportDatabase} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Information</CardTitle>
            <CardDescription>
              Database configuration and details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Database Type</span>
              </div>
              <Badge variant="outline">Cloudflare D1 (SQLite)</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Total Size</span>
              </div>
              <span className="text-sm" title="Cloudflare D1 does not expose storage size over SQL">
                {formatFileSize(stats?.totalSize)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Last Updated</span>
              </div>
              <span className="text-sm">
                {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDatabase;
