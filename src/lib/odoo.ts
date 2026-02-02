
// 'use server';
// import Odoo from 'odoo-xmlrpc';

export interface OdooCredentials {
    url: string;
    db: string;
    username: string;
    apiKey: string; // This is the 'password' or API key for the user
}

export interface OdooApproval {
    id: number;
    name: string;
    'category_id': [number, string]; // e.g. [1, "Contact Creation"]
    'request_owner_id': [number, string]; // e.g. [2, "Mitchell Admin"]
    'date_start': string; // e.g. "2024-05-22"
}

/**
 * Connects to Odoo and fetches approvals for the authenticated user.
 * This is a more direct query method.
 */
// export async function getOdooApprovals(creds: OdooCredentials): Promise<OdooApproval[]> {
//     const { url, db, username, apiKey } = creds;
//     const odoo = new Odoo({ url, db, username, password: apiKey });
//     try {
//         await odoo.connect();
//         const approvals = await odoo.execute_kw('approval.request', 'search_read', [
//             [['approver_ids.user_id', '=', odoo.uid]],
//             ['id', 'name', 'category_id', 'request_owner_id', 'date_start']
//         ]);
//         return approvals as OdooApproval[];
//     } catch (e: any) {
//         console.error('Odoo API Error:', e);
//         return [];
//     }
// }

export async function getOdooApprovals(creds: OdooCredentials): Promise<OdooApproval[]> {
    console.warn("Odoo integration is disabled for static export (GitHub Pages).");
    return [];
}
