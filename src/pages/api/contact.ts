import type { APIRoute } from 'astro';
import { createContactDependencies } from '@views/contact/api/contact-dependencies';
import { handleContactRequest, outcomeToResponse } from '@views/contact/api/handle-contact-request';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const dependencies = createContactDependencies(locals, request.headers.get('user-agent'));
    return outcomeToResponse(await handleContactRequest(request, dependencies));
  } catch {
    return outcomeToResponse({ status: 'mail_failed' });
  }
};
