import type { Env } from '../types';

const JOBS = {
  daily: ['critical_site_health', 'booking_funnel_health'],
  weekly: ['search_observation_review', 'competitor_diff_review', 'ai_visibility_sampling', 'performance_snapshot'],
  monthly: ['authority_review', 'content_gap_analysis', 'conversion_review', 'thirty_day_scorecard'],
} as const;

export type MonitoringCadence = keyof typeof JOBS;

export async function queueGrowthMonitoring(env: Env, cadence: MonitoringCadence): Promise<void> {
  const statements = JOBS[cadence].map((jobName) => env.DB.prepare(
    `INSERT INTO monitoring_runs (cadence, job_name, status, result_summary) VALUES (?, ?, 'queued', ?)`
  ).bind(cadence, jobName, 'Awaiting authenticated review or configured connector execution.'));
  await env.DB.batch(statements);
}
