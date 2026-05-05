import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { EditClientForm } from '@/components/clients/EditClientForm';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      companyLogo: true,
      status: true,
    },
  });

  if (!client || client.userId !== user.id) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNav user={user} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/clients/${client.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M9.78 4.22a.75.75 0 010 1.06L5.81 9.25H17a.75.75 0 010 1.5H5.81l3.97 3.97a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
          Back to client
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Edit {client.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Update contact details, branding, and status.
          </p>
        </div>

        <div className="mt-8">
          <EditClientForm
            client={{
              id: client.id,
              name: client.name,
              email: client.email,
              companyLogo: client.companyLogo,
              status: client.status,
            }}
          />
        </div>
      </main>
    </div>
  );
}
