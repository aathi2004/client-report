import { Resend } from 'resend';

import { prisma } from '@/lib/prisma';

export class ReportSendError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = 'ReportSendError';
  }
}

type SendInput = {
  reportId: string;
  to?: string;
  note?: string;
};

type SendResult = {
  sentTo: string;
  reportId: string;
};

export async function sendReportEmail(input: SendInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new ReportSendError('Email is not configured. Set RESEND_API_KEY.', 500);
  }

  const report = await prisma.report.findUnique({
    where: { id: input.reportId },
    include: {
      client: true,
      user: { select: { name: true, email: true, agency: true } },
    },
  });
  if (!report) throw new ReportSendError('Report not found.', 404);
  if (report.status !== 'COMPLETED' || !report.pdfUrl) {
    throw new ReportSendError('Report is not ready to send yet.', 400);
  }

  const recipient = (input.to ?? report.client.email).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new ReportSendError('Invalid recipient email.', 400);
  }

  let attachment: Buffer | null = null;
  try {
    const res = await fetch(report.pdfUrl);
    if (res.ok) {
      attachment = Buffer.from(await res.arrayBuffer());
    } else {
      console.warn(`[reports/send] PDF fetch ${res.status}; sending link-only email`);
    }
  } catch (err) {
    console.warn('[reports/send] PDF fetch failed; sending link-only email', err);
  }

  const agencyName =
    report.user.agency?.name ?? report.user.name ?? report.user.email ?? 'Client Reporting';
  const from = process.env.EMAIL_FROM ?? 'no-reply@example.com';
  const typeLabel =
    report.type === 'MONTHLY' ? 'Monthly' : report.type === 'WEEKLY' ? 'Weekly' : 'Custom';
  const periodLabel = `${formatDate(report.dateFrom)} – ${formatDate(report.dateTo)}`;
  const subject = `Your ${typeLabel.toLowerCase()} report from ${agencyName}`;
  const filename = `${slug(report.client.name)}-${typeLabel.toLowerCase()}-report.pdf`;

  const html = renderEmail({
    clientName: report.client.name,
    agencyName,
    typeLabel,
    periodLabel,
    pdfUrl: report.pdfUrl,
    note: input.note,
  });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: recipient,
    subject,
    html,
    attachments: attachment ? [{ filename, content: attachment }] : undefined,
  });

  if (error) {
    console.error('[reports/send] Resend send failed:', error);
    throw new ReportSendError(error.message ?? 'Email failed.', 502);
  }

  await prisma.report.update({
    where: { id: report.id },
    data: { sentAt: new Date(), lastSentTo: recipient },
  });

  return { sentTo: recipient, reportId: report.id };
}

function renderEmail(args: {
  clientName: string;
  agencyName: string;
  typeLabel: string;
  periodLabel: string;
  pdfUrl: string;
  note?: string;
}) {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #18181b;">
  <h1 style="font-size: 18px; margin: 0 0 8px;">Your ${args.typeLabel.toLowerCase()} report is ready</h1>
  <p style="margin: 0 0 16px; color: #52525b; line-height: 1.5;">
    Hi ${escapeHtml(args.clientName)}, here's your ${args.typeLabel.toLowerCase()} report for
    <strong>${escapeHtml(args.periodLabel)}</strong>. The PDF is attached and also available at the link below.
  </p>
  ${
    args.note
      ? `<p style="margin: 0 0 16px; padding: 12px 16px; background: #fafafa; border-left: 3px solid #18181b; color: #27272a; line-height: 1.5;">${escapeHtml(
          args.note,
        )}</p>`
      : ''
  }
  <p style="margin: 24px 0;">
    <a href="${args.pdfUrl}" style="display: inline-block; padding: 12px 20px; background: #18181b; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500;">View report</a>
  </p>
  <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">— ${escapeHtml(args.agencyName)}</p>
</div>`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'client';
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
