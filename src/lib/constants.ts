// Default options for company, office, and position selections

export interface SelectOption {
    id: string;
    label: string;
}

export const DEFAULT_COMPANIES: SelectOption[] = [
    { id: 'hts_group', label: 'company_hts_group' },
    { id: 'hts', label: 'company_hts' },
    { id: 'other', label: 'company_other' },
];

export const DEFAULT_OFFICES: SelectOption[] = [
    { id: 'main', label: 'office_main' },
    { id: 'sulaymaniyah', label: 'office_sulaymaniyah' },
    { id: 'kirkuk', label: 'office_kirkuk' },
    { id: 'diyala', label: 'office_diyala' },
];

export const DEFAULT_POSITIONS: SelectOption[] = [
    { id: 'executive_director', label: 'position_executive_director' },
    { id: 'ceo', label: 'position_ceo' },
    { id: 'deputy_ceo', label: 'position_deputy_ceo' },
    { id: 'assistant_ceo', label: 'position_assistant_ceo' },
    { id: 'executive_officer', label: 'position_executive_officer' },
    { id: 'assistant_executive', label: 'position_assistant_executive' },
    { id: 'executive_employee', label: 'position_executive_employee' },
];

// Check if a company is HTS (requires office selection)
export const isHTSCompany = (companyId: string): boolean => {
    return companyId === 'hts';
};
