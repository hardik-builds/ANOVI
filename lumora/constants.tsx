
import { ScreenSpec } from './types';

export const WEB_ADMIN_SCREENS: ScreenSpec[] = [
  {
    id: 'web-dashboard',
    name: 'Executive Dashboard',
    purpose: 'High-level business performance overview.',
    actions: ['Filter by date', 'Export reports', 'Toggle channel metrics'],
    entities: ['Sales', 'Revenue', 'Active Orders'],
    module: 'Analytics',
    platform: 'Web'
  },
  {
    id: 'web-inventory',
    name: 'Master Inventory Control',
    purpose: 'Real-time tracking of raw materials (stones, gold, settings).',
    actions: ['Add stock', 'Update unit price', 'Set low-stock alerts'],
    entities: ['InventoryItem', 'Vendor'],
    module: 'Inventory',
    platform: 'Web'
  },
  {
    id: 'web-products',
    name: 'Product Catalog Management',
    purpose: 'Curate luxury collections and detailed SKU specs.',
    actions: ['Bulk upload images', 'Edit pricing tiers', 'Sync to website'],
    entities: ['Product', 'Collection'],
    module: 'Products',
    platform: 'Web'
  },
  {
    id: 'web-prospects',
    name: 'Prospect Orders Pipeline',
    purpose: 'Information gathering & pending confirmation tracking for potential high-jewelry orders.',
    actions: ['Record prospect specs', 'Track metal/stone/size confirmations', 'One-click convert to active order'],
    entities: ['ProspectOrder', 'Customer', 'BespokeOrder'],
    module: 'Prospects',
    platform: 'Web'
  },
  {
    id: 'web-orders',
    name: 'Order Fulfillment Hub',
    purpose: 'Centralized management of all multi-channel sales.',
    actions: ['Assign craftsman', 'Update shipping status', 'Generate invoice'],
    entities: ['Order', 'Customer', 'Shipping'],
    module: 'Orders',
    platform: 'Web'
  },
  {
    id: 'web-custom',
    name: 'Custom Order Workshop',
    purpose: 'Track high-ticket bespoke design workflows.',
    actions: ['Upload sketches', 'Log customer feedback', 'Approve CAD models'],
    entities: ['BespokeOrder', 'DesignDraft'],
    module: 'Custom Orders',
    platform: 'Web'
  },
  {
    id: 'web-craftsmen',
    name: 'Artisan Directory',
    purpose: 'Manage internal and external jewelry makers.',
    actions: ['Assign tasks', 'Track labor costs', 'Rate quality'],
    entities: ['Craftsman', 'ProductionLog'],
    module: 'Craftsmen',
    platform: 'Web'
  },
  {
    id: 'web-resellers',
    name: 'Partner & Reseller Portal',
    purpose: 'Manage B2B relationships and commissions.',
    actions: ['Configure discount tiers', 'Process B2B bulk orders'],
    entities: ['Reseller', 'CommissionRule'],
    module: 'Resellers',
    platform: 'Web'
  },
  {
    id: 'web-payments',
    name: 'Financial Ledger',
    purpose: 'Track all incoming payments and installments.',
    actions: ['Verify bank transfers', 'Issue refunds', 'Tax reporting'],
    entities: ['Transaction', 'Invoice'],
    module: 'Payments',
    platform: 'Web'
  }
];

export const MOBILE_APP_SCREENS: ScreenSpec[] = [
  {
    id: 'mob-catalog',
    name: 'Sales Presentation Mode',
    purpose: 'In-person client showcasing of products.',
    actions: ['Zoom high-res photos', 'Share via WhatsApp', 'Check stock'],
    entities: ['Product', 'Collection'],
    module: 'Products',
    platform: 'Mobile'
  },
  {
    id: 'mob-order-entry',
    name: 'Quick Checkout',
    purpose: 'Fast order creation for social media or offline pop-ups.',
    actions: ['Scan barcode', 'Apply manual discount', 'Take deposit'],
    entities: ['Order', 'Payment'],
    module: 'Orders',
    platform: 'Mobile'
  },
  {
    id: 'mob-custom-capture',
    name: 'Bespoke Inspiration Sync',
    purpose: 'Capture client references and sketches on-the-go.',
    actions: ['Take photo', 'Record voice notes', 'Select materials'],
    entities: ['BespokeOrder', 'MediaAsset'],
    module: 'Custom Orders',
    platform: 'Mobile'
  },
  {
    id: 'mob-artisan-updates',
    name: 'Craftsman Status App',
    purpose: 'Allow artisans to update production progress from the bench.',
    actions: ['Mark milestone complete', 'Upload QC photos'],
    entities: ['OrderPart', 'Craftsman'],
    module: 'Craftsmen',
    platform: 'Mobile'
  },
  {
    id: 'mob-social-inbox',
    name: 'Multi-Channel Sales Inbox',
    purpose: 'Consolidated DMs from WhatsApp/Insta for sales.',
    actions: ['Reply to lead', 'Convert DM to Order'],
    entities: ['Conversation', 'Lead'],
    module: 'Sell Channels',
    platform: 'Mobile'
  }
];
