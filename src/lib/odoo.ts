
'use server';

// This file contains the logic for a REAL Odoo connection.
// It requires the 'odoo-xmlrpc' library, which should be in package.json.

import Odoo from 'odoo-xmlrpc';

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
export async function getOdooApprovals(creds: OdooCredentials): Promise<OdooApproval[]> {
    const { url, db, username, apiKey } = creds;

    const odoo = new Odoo({
        url,
        db,
        username,
        password: apiKey, // The library uses 'password' for the API key
    });

    try {
        await odoo.connect();
        console.log("Successfully connected to Odoo with direct query method.");

        // New, more robust query: Find requests where the current user is in the list of approvers.
        // This is the most common way approvals are assigned in Odoo.
        const approvals = await odoo.execute_kw('approval.request', 'search_read', [
            [['approver_ids.user_id', '=', odoo.uid]], // Look inside the approver_ids for the current user.
            ['id', 'name', 'category_id', 'request_owner_id', 'date_start'] // Fields to retrieve
        ]);

        // FIX: Ensure the result is always an array to prevent crashes.
        // If odoo.execute_kw returns undefined, null, or false, default to an empty array.
        if (!Array.isArray(approvals)) {
            console.warn(`Odoo API returned a non-array response for approvals:`, approvals);
            return [];
        }

        console.log(`Found ${approvals.length} approvals for this user via direct query on approver_ids.`);

        return approvals as OdooApproval[];

    } catch (e: any) {
        console.error('Odoo API Error (Direct Query Method):', e);
        const errorMessage = e.message || 'An unknown error occurred during the Odoo API call.';
        if (String(errorMessage).includes('Access denied')) {
            throw new Error('Authentication failed. Please check your Odoo credentials.');
        }
        throw new Error(`Odoo API connection failed: ${errorMessage}`);
    }
}
