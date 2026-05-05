export const POOL_DETAILS_DATA = [
  {
    id: 'POOL-001',
    name: 'Retail Pool - D1 Category',
    subtitle: 'D1 Receivables',
    spvId: 'SPV-001',
    associatedSpv: 'Smile Wave SPV-1',
    status: 'Active',
    summaryCards: [
      { title: 'Pool Value', value: 'INR 180 Cr', icon: 'solar:chart-square-bold' },
      { title: 'Total Investors', value: 25, icon: 'solar:users-group-rounded-bold' },
      { title: 'Active Merchants', value: 45, icon: 'solar:buildings-3-bold' },
      { title: 'Payment Gateways', value: 3, icon: 'solar:card-bold' },
    ],
    overview: {
      poolType: 'D1 Receivables',
      poolId: 'POOL-D1-2026-001',
      createdOn: 'Feb 15, 2026',
      associatedSpv: 'Smile Wave SPV-1',
      status: 'Active',
    },
    financialSummary: {
      currentPoolValue: 'INR 180 Cr',
      deployed: 'INR 165 Cr',
      available: 'INR 15 Cr',
      avgHaircut: '8%',
      expectedYield: '12.5%',
    },
    transactionFlow: {
      description:
        'This pool operates on a D1 receivables model where merchant transactions are settled T+1 day after collection.',
      steps: [
        {
          title: 'Customer Payment',
          description: 'Customer pays via payment gateway (Razorpay/PhonePe/Paytm)',
        },
        {
          title: 'Gateway Collection',
          description: 'Payment gateway receives funds in their pool account',
        },
        {
          title: 'T+1 Settlement',
          description: 'After 1 day, funds are transferred to merchant receivables pool',
        },
        {
          title: 'Haircut Application',
          description: '8% haircut applied as per pool configuration',
        },
        {
          title: 'Investor Distribution',
          description: 'Net funds distributed to investors based on PTC holdings',
        },
        {
          title: 'SPV Escrow',
          description: 'Funds route through SPV-1 escrow account for regulatory compliance',
        },
      ],
    },
  },
  {
    id: 'POOL-002',
    name: 'Corporate Pool - D0 Category',
    subtitle: 'D0 Receivables',
    spvId: 'SPV-001',
    associatedSpv: 'Smile Wave SPV-1',
    status: 'Active',
    summaryCards: [
      { title: 'Pool Value', value: 'INR 210 Cr', icon: 'solar:chart-square-bold' },
      { title: 'Total Investors', value: 18, icon: 'solar:users-group-rounded-bold' },
      { title: 'Active Merchants', value: 28, icon: 'solar:buildings-3-bold' },
      { title: 'Payment Gateways', value: 2, icon: 'solar:card-bold' },
    ],
    overview: {
      poolType: 'D0 Receivables',
      poolId: 'POOL-D0-2026-002',
      createdOn: 'Feb 10, 2026',
      associatedSpv: 'Smile Wave SPV-1',
      status: 'Active',
    },
    financialSummary: {
      currentPoolValue: 'INR 210 Cr',
      deployed: 'INR 188 Cr',
      available: 'INR 22 Cr',
      avgHaircut: '6%',
      expectedYield: '11.8%',
    },
    transactionFlow: {
      description:
        'This pool operates on a D0 receivables cycle where collections are settled on the same day for faster deployment.',
      steps: [
        {
          title: 'Customer Payment',
          description: 'Customer completes payment using configured gateway partners',
        },
        {
          title: 'Same-Day Pooling',
          description: 'Gateway consolidates collections in the pool account on D0',
        },
        {
          title: 'Merchant Allocation',
          description: 'Eligible merchant receivables are tagged for deployment',
        },
        {
          title: 'Haircut Application',
          description: '6% haircut retained as per this corporate pool structure',
        },
        {
          title: 'PTC Settlement',
          description: 'Cashflows are matched to the outstanding PTC obligations',
        },
        {
          title: 'Escrow Reconciliation',
          description: 'SPV escrow reconciles settlement entries and closes the cycle',
        },
      ],
    },
  },
  {
    id: 'POOL-003',
    name: 'Mixed Pool - D1/D2 Category',
    subtitle: 'Mixed Receivables',
    spvId: 'SPV-001',
    associatedSpv: 'Smile Wave SPV-1',
    status: 'Active',
    summaryCards: [
      { title: 'Pool Value', value: 'INR 120 Cr', icon: 'solar:chart-square-bold' },
      { title: 'Total Investors', value: 14, icon: 'solar:users-group-rounded-bold' },
      { title: 'Active Merchants', value: 32, icon: 'solar:buildings-3-bold' },
      { title: 'Payment Gateways', value: 2, icon: 'solar:card-bold' },
    ],
    overview: {
      poolType: 'Mixed Receivables',
      poolId: 'POOL-MX-2026-003',
      createdOn: 'Feb 08, 2026',
      associatedSpv: 'Smile Wave SPV-1',
      status: 'Active',
    },
    financialSummary: {
      currentPoolValue: 'INR 120 Cr',
      deployed: 'INR 104 Cr',
      available: 'INR 16 Cr',
      avgHaircut: '9%',
      expectedYield: '13.0%',
    },
    transactionFlow: {
      description:
        'This mixed pool blends D1 and D2 receivables and routes them through a staggered settlement model.',
      steps: [
        {
          title: 'Customer Payment',
          description: 'Receivables are created from customer checkout events',
        },
        {
          title: 'Gateway Collection',
          description: 'Different gateways collect and batch the incoming settlements',
        },
        {
          title: 'Bucket Assignment',
          description: 'Transactions are assigned to D1 or D2 receivable buckets',
        },
        {
          title: 'Haircut Application',
          description: '9% haircut is applied to account for mixed pool risk',
        },
        {
          title: 'Investor Allocation',
          description: 'Net realized value is allocated across active investor series',
        },
        {
          title: 'Escrow Compliance',
          description: 'Final cash movement passes through the SPV escrow account',
        },
      ],
    },
  },
  {
    id: 'POOL-101',
    name: 'Gold Pool - D0 Category',
    subtitle: 'D0 Receivables',
    spvId: 'SPV-002',
    associatedSpv: 'Smile Wave SPV-2',
    status: 'Active',
    summaryCards: [
      { title: 'Pool Value', value: 'INR 160 Cr', icon: 'solar:chart-square-bold' },
      { title: 'Total Investors', value: 16, icon: 'solar:users-group-rounded-bold' },
      { title: 'Active Merchants', value: 22, icon: 'solar:buildings-3-bold' },
      { title: 'Payment Gateways', value: 2, icon: 'solar:card-bold' },
    ],
    overview: {
      poolType: 'D0 Receivables',
      poolId: 'POOL-GL-2026-101',
      createdOn: 'Feb 12, 2026',
      associatedSpv: 'Smile Wave SPV-2',
      status: 'Active',
    },
    financialSummary: {
      currentPoolValue: 'INR 160 Cr',
      deployed: 'INR 145 Cr',
      available: 'INR 15 Cr',
      avgHaircut: '7%',
      expectedYield: '12.2%',
    },
    transactionFlow: {
      description:
        'This gold-category pool uses a same-day settlement cycle optimized for high-quality merchants.',
      steps: [
        {
          title: 'Customer Payment',
          description: 'Customers pay merchants through approved gateway channels',
        },
        {
          title: 'Instant Capture',
          description: 'Gateway captures and marks collections for D0 settlement',
        },
        {
          title: 'Pool Credit',
          description: 'Receivable pool is credited on the same business day',
        },
        {
          title: 'Haircut Application',
          description: '7% haircut buffer is applied before downstream allocation',
        },
        {
          title: 'Yield Distribution',
          description: 'Investor-linked returns are computed from realized settlements',
        },
        {
          title: 'Escrow Close',
          description: 'Escrow closes the cycle and records compliance references',
        },
      ],
    },
  },
  {
    id: 'POOL-102',
    name: 'Gold Pool - D1 Category',
    subtitle: 'D1 Receivables',
    spvId: 'SPV-002',
    associatedSpv: 'Smile Wave SPV-2',
    status: 'Pending',
    summaryCards: [
      { title: 'Pool Value', value: 'INR 90 Cr', icon: 'solar:chart-square-bold' },
      { title: 'Total Investors', value: 9, icon: 'solar:users-group-rounded-bold' },
      { title: 'Active Merchants', value: 14, icon: 'solar:buildings-3-bold' },
      { title: 'Payment Gateways', value: 1, icon: 'solar:card-bold' },
    ],
    overview: {
      poolType: 'D1 Receivables',
      poolId: 'POOL-GL-2026-102',
      createdOn: 'Feb 18, 2026',
      associatedSpv: 'Smile Wave SPV-2',
      status: 'Pending',
    },
    financialSummary: {
      currentPoolValue: 'INR 90 Cr',
      deployed: 'INR 52 Cr',
      available: 'INR 38 Cr',
      avgHaircut: '8%',
      expectedYield: '12.9%',
    },
    transactionFlow: {
      description:
        'This pending pool is configured for a D1 flow and will activate once merchant onboarding is completed.',
      steps: [
        {
          title: 'Customer Payment',
          description: 'Transactions are accepted through the selected gateway setup',
        },
        {
          title: 'Gateway Hold',
          description: 'Collections remain in gateway hold state until settlement day',
        },
        {
          title: 'T+1 Pool Credit',
          description: 'Funds are routed to the receivables pool on the next day',
        },
        {
          title: 'Haircut Application',
          description: '8% haircut will apply once the pool is marked active',
        },
        {
          title: 'Investor Mapping',
          description: 'Linked investor series will be assigned after activation',
        },
        {
          title: 'Escrow Oversight',
          description: 'SPV-2 escrow will supervise all regulated movement',
        },
      ],
    },
  },
  {
    id: 'POOL-201',
    name: 'MSME Pool - D1 Category',
    subtitle: 'D1 Receivables',
    spvId: 'SPV-003',
    associatedSpv: 'Smile Wave SPV-3',
    status: 'Active',
    summaryCards: [
      { title: 'Pool Value', value: 'INR 240 Cr', icon: 'solar:chart-square-bold' },
      { title: 'Total Investors', value: 22, icon: 'solar:users-group-rounded-bold' },
      { title: 'Active Merchants', value: 38, icon: 'solar:buildings-3-bold' },
      { title: 'Payment Gateways', value: 4, icon: 'solar:card-bold' },
    ],
    overview: {
      poolType: 'D1 Receivables',
      poolId: 'POOL-MS-2026-201',
      createdOn: 'Mar 02, 2026',
      associatedSpv: 'Smile Wave SPV-3',
      status: 'Active',
    },
    financialSummary: {
      currentPoolValue: 'INR 240 Cr',
      deployed: 'INR 218 Cr',
      available: 'INR 22 Cr',
      avgHaircut: '7%',
      expectedYield: '12.6%',
    },
    transactionFlow: {
      description:
        'This MSME pool processes D1 receivables with diversified merchant and gateway participation.',
      steps: [
        {
          title: 'Customer Payment',
          description: 'Customer payments are captured across multiple partner gateways',
        },
        {
          title: 'Batch Collection',
          description: 'Gateways batch collections and align them to merchant references',
        },
        {
          title: 'T+1 Settlement',
          description: 'The MSME pool receives funds on T+1 after reconciliation',
        },
        {
          title: 'Haircut Application',
          description: '7% haircut is used to preserve the MSME coverage buffer',
        },
        {
          title: 'Investor Yield Allocation',
          description: 'Cashflows are split across active PTC investors',
        },
        {
          title: 'Escrow Monitoring',
          description: 'SPV escrow monitors and records the complete movement chain',
        },
      ],
    },
  },
  {
    id: 'POOL-202',
    name: 'MSME Pool - D2 Category',
    subtitle: 'D2 Receivables',
    spvId: 'SPV-003',
    associatedSpv: 'Smile Wave SPV-3',
    status: 'Active',
    summaryCards: [
      { title: 'Pool Value', value: 'INR 180 Cr', icon: 'solar:chart-square-bold' },
      { title: 'Total Investors', value: 17, icon: 'solar:users-group-rounded-bold' },
      { title: 'Active Merchants', value: 29, icon: 'solar:buildings-3-bold' },
      { title: 'Payment Gateways', value: 3, icon: 'solar:card-bold' },
    ],
    overview: {
      poolType: 'D2 Receivables',
      poolId: 'POOL-MS-2026-202',
      createdOn: 'Mar 04, 2026',
      associatedSpv: 'Smile Wave SPV-3',
      status: 'Active',
    },
    financialSummary: {
      currentPoolValue: 'INR 180 Cr',
      deployed: 'INR 154 Cr',
      available: 'INR 26 Cr',
      avgHaircut: '9%',
      expectedYield: '11.9%',
    },
    transactionFlow: {
      description:
        'This D2 pool follows a longer collection curve and a conservative distribution schedule.',
      steps: [
        {
          title: 'Customer Payment',
          description: 'Transactions originate from MSME merchant checkout channels',
        },
        {
          title: 'Gateway Collection',
          description: 'Gateways hold and reconcile collections across the D2 timeline',
        },
        {
          title: 'T+2 Settlement',
          description: 'Funds reach the pool after the two-day settlement window',
        },
        {
          title: 'Haircut Application',
          description: '9% haircut is retained to cover D2 settlement risk',
        },
        {
          title: 'Investor Remittance',
          description: 'PTC investors receive net distributable cashflows post validation',
        },
        {
          title: 'Escrow Closure',
          description: 'Escrow posts the final ledger and closes the collection cycle',
        },
      ],
    },
  },
  {
    id: 'POOL-203',
    name: 'MSME Mixed Pool',
    subtitle: 'Mixed Receivables',
    spvId: 'SPV-003',
    associatedSpv: 'Smile Wave SPV-3',
    status: 'Active',
    summaryCards: [
      { title: 'Pool Value', value: 'INR 120 Cr', icon: 'solar:chart-square-bold' },
      { title: 'Total Investors', value: 11, icon: 'solar:users-group-rounded-bold' },
      { title: 'Active Merchants', value: 17, icon: 'solar:buildings-3-bold' },
      { title: 'Payment Gateways', value: 2, icon: 'solar:card-bold' },
    ],
    overview: {
      poolType: 'Mixed Receivables',
      poolId: 'POOL-MS-2026-203',
      createdOn: 'Mar 06, 2026',
      associatedSpv: 'Smile Wave SPV-3',
      status: 'Active',
    },
    financialSummary: {
      currentPoolValue: 'INR 120 Cr',
      deployed: 'INR 101 Cr',
      available: 'INR 19 Cr',
      avgHaircut: '8%',
      expectedYield: '12.3%',
    },
    transactionFlow: {
      description:
        'This mixed MSME pool combines multiple receivable types and distributes settlement based on bucket logic.',
      steps: [
        {
          title: 'Customer Payment',
          description: 'Payments are initiated across merchant channels and partner gateways',
        },
        {
          title: 'Collection Aggregation',
          description: 'Incoming settlements are aggregated into the master pool account',
        },
        {
          title: 'Receivable Segregation',
          description: 'Transactions are tagged and separated by their due-date category',
        },
        {
          title: 'Haircut Application',
          description: '8% haircut is applied across the mixed receivable structure',
        },
        {
          title: 'PTC Distribution',
          description: 'Series holders receive net proceeds according to issue terms',
        },
        {
          title: 'Escrow Governance',
          description: 'Escrow validates movement and compliance before cycle close',
        },
      ],
    },
  },
  {
    id: 'POOL-301',
    name: 'Consumer Pool - Closure Category',
    subtitle: 'Closed Receivables',
    spvId: 'SPV-004',
    associatedSpv: 'Smile Wave SPV-4',
    status: 'Closed',
    summaryCards: [
      { title: 'Pool Value', value: 'INR 80 Cr', icon: 'solar:chart-square-bold' },
      { title: 'Total Investors', value: 7, icon: 'solar:users-group-rounded-bold' },
      { title: 'Active Merchants', value: 9, icon: 'solar:buildings-3-bold' },
      { title: 'Payment Gateways', value: 1, icon: 'solar:card-bold' },
    ],
    overview: {
      poolType: 'Closed Receivables',
      poolId: 'POOL-CN-2026-301',
      createdOn: 'Jan 28, 2026',
      associatedSpv: 'Smile Wave SPV-4',
      status: 'Closed',
    },
    financialSummary: {
      currentPoolValue: 'INR 80 Cr',
      deployed: 'INR 80 Cr',
      available: 'INR 0 Cr',
      avgHaircut: '10%',
      expectedYield: '10.8%',
    },
    transactionFlow: {
      description:
        'This closed pool reflects the completed cashflow path used before maturity and settlement closure.',
      steps: [
        {
          title: 'Customer Payment',
          description: 'Consumers completed repayment through the historical gateway setup',
        },
        {
          title: 'Collection Posting',
          description: 'Collections were posted into the closure pool account',
        },
        {
          title: 'Receivable Realization',
          description: 'Underlying receivables were fully realized over the closure period',
        },
        {
          title: 'Haircut Application',
          description: '10% haircut was retained under the closure pool policy',
        },
        {
          title: 'Final Investor Settlement',
          description: 'All outstanding investor dues were paid and marked settled',
        },
        {
          title: 'Pool Closure',
          description: 'Escrow and trustee records were closed after full settlement',
        },
      ],
    },
  },
];

export const POOL_INVESTOR_DETAILS = {
  'POOL-001': [
    {
      investorId: 'INV-001',
      investorName: 'Axis Mutual Fund',
      purchasedOn: 'Feb 20, 2026',
      ptcInvestment: 'INR 250 Cr',
      interestDue: 'INR 250.00 L',
      escrowAccount: 'YESB0INV0045123456',
      transactions: '3/3',
      successfulTransfers: '3 Successful Transfers',
      transferAmount: 'INR 250 Cr',
    },
    {
      investorId: 'INV-002',
      investorName: 'ICICI Prudential',
      purchasedOn: 'Feb 18, 2026',
      ptcInvestment: 'INR 180 Cr',
      interestDue: 'INR 185.50 L',
      escrowAccount: 'ICIC0INV0098456123',
      transactions: '2/2',
      successfulTransfers: '2 Successful Transfers',
      transferAmount: 'INR 180 Cr',
    },
    {
      investorId: 'INV-003',
      investorName: 'Suresh Raina',
      purchasedOn: 'Feb 15, 2026',
      ptcInvestment: 'INR 120 Cr',
      interestDue: 'INR 121.20 L',
      escrowAccount: 'HDFC0INV0012567345',
      transactions: '4/4',
      successfulTransfers: '4 Successful Transfers',
      transferAmount: 'INR 120 Cr',
    },
  ],
  'POOL-002': [
    {
      investorId: 'INV-001',
      investorName: 'Axis Mutual Fund',
      purchasedOn: 'Feb 12, 2026',
      ptcInvestment: 'INR 210 Cr',
      interestDue: 'INR 198.00 L',
      escrowAccount: 'YESB0INV0045123456',
      transactions: '3/3',
      successfulTransfers: '3 Successful Transfers',
      transferAmount: 'INR 210 Cr',
    },
    {
      investorId: 'INV-002',
      investorName: 'ICICI Prudential',
      purchasedOn: 'Feb 11, 2026',
      ptcInvestment: 'INR 95 Cr',
      interestDue: 'INR 94.40 L',
      escrowAccount: 'AXIS0INV0074123980',
      transactions: '2/2',
      successfulTransfers: '2 Successful Transfers',
      transferAmount: 'INR 95 Cr',
    },
  ],
  'POOL-003': [
    {
      investorId: 'INV-002',
      investorName: 'ICICI Prudential',
      purchasedOn: 'Feb 10, 2026',
      ptcInvestment: 'INR 70 Cr',
      interestDue: 'INR 73.10 L',
      escrowAccount: 'ICIC0INV0098456123',
      transactions: '3/3',
      successfulTransfers: '3 Successful Transfers',
      transferAmount: 'INR 70 Cr',
    },
    {
      investorId: 'INV-003',
      investorName: 'Suresh Raina',
      purchasedOn: 'Feb 09, 2026',
      ptcInvestment: 'INR 50 Cr',
      interestDue: 'INR 51.80 L',
      escrowAccount: 'SBIN0INV0045123012',
      transactions: '2/2',
      successfulTransfers: '2 Successful Transfers',
      transferAmount: 'INR 50 Cr',
    },
  ],
  'POOL-101': [
    {
      investorId: 'INV-003',
      investorName: 'Suresh Raina',
      purchasedOn: 'Feb 14, 2026',
      ptcInvestment: 'INR 100 Cr',
      interestDue: 'INR 102.60 L',
      escrowAccount: 'HDFC0INV0012567345',
      transactions: '4/4',
      successfulTransfers: '4 Successful Transfers',
      transferAmount: 'INR 100 Cr',
    },
    {
      investorId: 'INV-002',
      investorName: 'ICICI Prudential',
      purchasedOn: 'Feb 13, 2026',
      ptcInvestment: 'INR 60 Cr',
      interestDue: 'INR 61.20 L',
      escrowAccount: 'AXIS0INV0074123980',
      transactions: '2/2',
      successfulTransfers: '2 Successful Transfers',
      transferAmount: 'INR 60 Cr',
    },
  ],
  'POOL-102': [
    {
      investorId: 'INV-003',
      investorName: 'Suresh Raina',
      purchasedOn: 'Feb 19, 2026',
      ptcInvestment: 'INR 45 Cr',
      interestDue: 'INR 46.75 L',
      escrowAccount: 'SBIN0INV0045123012',
      transactions: '1/1',
      successfulTransfers: '1 Successful Transfer',
      transferAmount: 'INR 45 Cr',
    },
  ],
  'POOL-201': [
    {
      investorId: 'INV-001',
      investorName: 'Axis Mutual Fund',
      purchasedOn: 'Mar 03, 2026',
      ptcInvestment: 'INR 140 Cr',
      interestDue: 'INR 145.20 L',
      escrowAccount: 'YESB0INV0045123456',
      transactions: '5/5',
      successfulTransfers: '5 Successful Transfers',
      transferAmount: 'INR 140 Cr',
    },
    {
      investorId: 'INV-002',
      investorName: 'ICICI Prudential',
      purchasedOn: 'Mar 03, 2026',
      ptcInvestment: 'INR 100 Cr',
      interestDue: 'INR 101.90 L',
      escrowAccount: 'ICIC0INV0023987456',
      transactions: '3/3',
      successfulTransfers: '3 Successful Transfers',
      transferAmount: 'INR 100 Cr',
    },
  ],
  'POOL-202': [
    {
      investorId: 'INV-002',
      investorName: 'ICICI Prudential',
      purchasedOn: 'Mar 05, 2026',
      ptcInvestment: 'INR 95 Cr',
      interestDue: 'INR 97.10 L',
      escrowAccount: 'ICIC0INV0098456123',
      transactions: '3/3',
      successfulTransfers: '3 Successful Transfers',
      transferAmount: 'INR 95 Cr',
    },
    {
      investorId: 'INV-002',
      investorName: 'ICICI Prudential',
      purchasedOn: 'Mar 05, 2026',
      ptcInvestment: 'INR 85 Cr',
      interestDue: 'INR 86.45 L',
      escrowAccount: 'ICIC0INV0023987456',
      transactions: '2/2',
      successfulTransfers: '2 Successful Transfers',
      transferAmount: 'INR 85 Cr',
    },
  ],
  'POOL-203': [
    {
      investorId: 'INV-003',
      investorName: 'Suresh Raina',
      purchasedOn: 'Mar 07, 2026',
      ptcInvestment: 'INR 65 Cr',
      interestDue: 'INR 66.30 L',
      escrowAccount: 'HDFC0INV0012567345',
      transactions: '2/2',
      successfulTransfers: '2 Successful Transfers',
      transferAmount: 'INR 65 Cr',
    },
    {
      investorId: 'INV-003',
      investorName: 'Suresh Raina',
      purchasedOn: 'Mar 07, 2026',
      ptcInvestment: 'INR 55 Cr',
      interestDue: 'INR 56.10 L',
      escrowAccount: 'SBIN0INV0045123012',
      transactions: '2/2',
      successfulTransfers: '2 Successful Transfers',
      transferAmount: 'INR 55 Cr',
    },
  ],
  'POOL-301': [
    {
      investorId: 'INV-002',
      investorName: 'ICICI Prudential',
      purchasedOn: 'Jan 30, 2026',
      ptcInvestment: 'INR 50 Cr',
      interestDue: 'INR 52.80 L',
      escrowAccount: 'AXIS0INV0074123980',
      transactions: '4/4',
      successfulTransfers: '4 Successful Transfers',
      transferAmount: 'INR 50 Cr',
    },
    {
      investorId: 'INV-002',
      investorName: 'ICICI Prudential',
      purchasedOn: 'Jan 29, 2026',
      ptcInvestment: 'INR 30 Cr',
      interestDue: 'INR 31.25 L',
      escrowAccount: 'ICIC0INV0023987456',
      transactions: '2/2',
      successfulTransfers: '2 Successful Transfers',
      transferAmount: 'INR 30 Cr',
    },
  ],
};

export const POOL_MERCHANTS_GATEWAYS = {
  'POOL-001': [
    { merchantId: 'HPCL-129639', merchantName: 'Rohan Petroleum', receivables: 'INR 15 Cr', gateway: 'Razorpay', status: 'Active' },
    { merchantId: 'TECH-456789', merchantName: 'Tech Solutions Pvt Ltd', receivables: 'INR 12 Cr', gateway: 'PhonePe', status: 'Active' },
    { merchantId: 'RETL-789012', merchantName: 'Mega Retail Corp', receivables: 'INR 18 Cr', gateway: 'Razorpay', status: 'Active' },
    { merchantId: 'DSI-567890', merchantName: 'Digital Services Inc', receivables: 'INR 10 Cr', gateway: 'Paytm', status: 'Active' },
  ],
  'POOL-002': [
    { merchantId: 'CORP-220145', merchantName: 'Corporate Edge Ltd', receivables: 'INR 22 Cr', gateway: 'Razorpay', status: 'Active' },
    { merchantId: 'B2B-330284', merchantName: 'TradeBridge Commerce', receivables: 'INR 16 Cr', gateway: 'Cashfree', status: 'Active' },
    { merchantId: 'SERV-119845', merchantName: 'Enterprise Services Co', receivables: 'INR 14 Cr', gateway: 'PhonePe', status: 'Pending' },
  ],
  'POOL-003': [
    { merchantId: 'MIX-440210', merchantName: 'Metro Wholesale Hub', receivables: 'INR 11 Cr', gateway: 'Razorpay', status: 'Active' },
    { merchantId: 'MIX-440211', merchantName: 'Quick Retail Network', receivables: 'INR 9 Cr', gateway: 'Paytm', status: 'Active' },
    { merchantId: 'MIX-440212', merchantName: 'SmartKart Services', receivables: 'INR 8 Cr', gateway: 'PhonePe', status: 'Active' },
  ],
  'POOL-101': [
    { merchantId: 'GLD-112340', merchantName: 'Golden Fuel Station', receivables: 'INR 13 Cr', gateway: 'Razorpay', status: 'Active' },
    { merchantId: 'GLD-112341', merchantName: 'Prime Trade Links', receivables: 'INR 10 Cr', gateway: 'Cashfree', status: 'Active' },
  ],
  'POOL-102': [
    { merchantId: 'GLD-221190', merchantName: 'Future Commerce Labs', receivables: 'INR 7 Cr', gateway: 'PhonePe', status: 'Pending' },
    { merchantId: 'GLD-221191', merchantName: 'Urban Checkout Systems', receivables: 'INR 5 Cr', gateway: 'Razorpay', status: 'Pending' },
  ],
  'POOL-201': [
    { merchantId: 'MSME-510100', merchantName: 'MSME Growth Partners', receivables: 'INR 24 Cr', gateway: 'Razorpay', status: 'Active' },
    { merchantId: 'MSME-510101', merchantName: 'Bharat Trade Network', receivables: 'INR 19 Cr', gateway: 'PhonePe', status: 'Active' },
    { merchantId: 'MSME-510102', merchantName: 'Rapid Services Market', receivables: 'INR 17 Cr', gateway: 'Paytm', status: 'Active' },
  ],
  'POOL-202': [
    { merchantId: 'MSME-620200', merchantName: 'D2 Merchant Collective', receivables: 'INR 14 Cr', gateway: 'Cashfree', status: 'Active' },
    { merchantId: 'MSME-620201', merchantName: 'Regional Seller Desk', receivables: 'INR 12 Cr', gateway: 'Razorpay', status: 'Active' },
    { merchantId: 'MSME-620202', merchantName: 'Trusted Supply Chain', receivables: 'INR 11 Cr', gateway: 'PhonePe', status: 'Inactive' },
  ],
  'POOL-203': [
    { merchantId: 'MSME-730301', merchantName: 'Mixed Retail Grid', receivables: 'INR 9 Cr', gateway: 'Razorpay', status: 'Active' },
    { merchantId: 'MSME-730302', merchantName: 'Merchant Support Co', receivables: 'INR 8 Cr', gateway: 'Paytm', status: 'Active' },
  ],
  'POOL-301': [
    { merchantId: 'CLS-880410', merchantName: 'Closed Consumer Mart', receivables: 'INR 6 Cr', gateway: 'Razorpay', status: 'Inactive' },
    { merchantId: 'CLS-880411', merchantName: 'Legacy Commerce House', receivables: 'INR 4 Cr', gateway: 'Cashfree', status: 'Inactive' },
  ],
};

export const POOL_GATEWAY_DISTRIBUTION = {
  'POOL-001': [
    { gateway: 'Razorpay', percentage: '47%', merchants: 18, totalVolume: 'INR 85 Cr' },
    { gateway: 'PhonePe', percentage: '34%', merchants: 15, totalVolume: 'INR 62 Cr' },
    { gateway: 'Paytm', percentage: '19%', merchants: 12, totalVolume: 'INR 33 Cr' },
  ],
  'POOL-002': [
    { gateway: 'Razorpay', percentage: '44%', merchants: 12, totalVolume: 'INR 74 Cr' },
    { gateway: 'Cashfree', percentage: '31%', merchants: 9, totalVolume: 'INR 52 Cr' },
    { gateway: 'PhonePe', percentage: '25%', merchants: 7, totalVolume: 'INR 42 Cr' },
  ],
  'POOL-003': [
    { gateway: 'Razorpay', percentage: '41%', merchants: 10, totalVolume: 'INR 49 Cr' },
    { gateway: 'Paytm', percentage: '33%', merchants: 8, totalVolume: 'INR 39 Cr' },
    { gateway: 'PhonePe', percentage: '26%', merchants: 7, totalVolume: 'INR 32 Cr' },
  ],
  'POOL-101': [
    { gateway: 'Razorpay', percentage: '56%', merchants: 9, totalVolume: 'INR 90 Cr' },
    { gateway: 'Cashfree', percentage: '44%', merchants: 7, totalVolume: 'INR 70 Cr' },
  ],
  'POOL-102': [
    { gateway: 'PhonePe', percentage: '58%', merchants: 5, totalVolume: 'INR 28 Cr' },
    { gateway: 'Razorpay', percentage: '42%', merchants: 4, totalVolume: 'INR 20 Cr' },
  ],
  'POOL-201': [
    { gateway: 'Razorpay', percentage: '39%', merchants: 15, totalVolume: 'INR 94 Cr' },
    { gateway: 'PhonePe', percentage: '34%', merchants: 13, totalVolume: 'INR 81 Cr' },
    { gateway: 'Paytm', percentage: '27%', merchants: 10, totalVolume: 'INR 65 Cr' },
  ],
  'POOL-202': [
    { gateway: 'Cashfree', percentage: '38%', merchants: 11, totalVolume: 'INR 68 Cr' },
    { gateway: 'Razorpay', percentage: '35%', merchants: 10, totalVolume: 'INR 63 Cr' },
    { gateway: 'PhonePe', percentage: '27%', merchants: 8, totalVolume: 'INR 49 Cr' },
  ],
  'POOL-203': [
    { gateway: 'Razorpay', percentage: '53%', merchants: 9, totalVolume: 'INR 44 Cr' },
    { gateway: 'Paytm', percentage: '47%', merchants: 8, totalVolume: 'INR 39 Cr' },
  ],
  'POOL-301': [
    { gateway: 'Razorpay', percentage: '60%', merchants: 4, totalVolume: 'INR 12 Cr' },
    { gateway: 'Cashfree', percentage: '40%', merchants: 3, totalVolume: 'INR 8 Cr' },
  ],
};

export const POOL_TRANSACTION_FLOW = {
  'POOL-001': {
    summaryCards: [
      { title: 'Total Transactions (MTD)', value: '1,247', icon: 'solar:bill-list-bold' },
      { title: 'Success Rate', value: '98.5%', icon: 'solar:check-circle-bold' },
      { title: 'Failed Transactions', value: '18', icon: 'solar:close-circle-bold' },
    ],
    transactions: [
      { id: 'TXN-POOL-9876', path: 'Investor Escrow (INV-001) -> SPV Escrow', amount: 'INR 250 Cr', date: 'Mar 9, 2026', time: '10:30:00', utr: 'YES2026030900987', status: 'Success', note: '3 Successful Transfers' },
      { id: 'TXN-POOL-9875', path: 'Investor Escrow (INV-002) -> SPV Escrow', amount: 'INR 320 Cr', date: 'Mar 8, 2026', time: '14:45:00', utr: 'N/A', status: 'Failed', note: 'Transaction Failed' },
      { id: 'TXN-POOL-9874', path: 'Merchant Gateway -> Pool Account', amount: 'INR 180 Cr', date: 'Mar 8, 2026', time: '09:15:00', utr: 'RAZ2026030800451', status: 'Success', note: 'Settled to pool' },
    ],
  },
  'POOL-002': {
    summaryCards: [
      { title: 'Total Transactions (MTD)', value: '984', icon: 'solar:bill-list-bold' },
      { title: 'Success Rate', value: '97.9%', icon: 'solar:check-circle-bold' },
      { title: 'Failed Transactions', value: '21', icon: 'solar:close-circle-bold' },
    ],
    transactions: [
      { id: 'TXN-POOL-8801', path: 'Investor Escrow (INV-001) -> SPV Escrow', amount: 'INR 210 Cr', date: 'Mar 9, 2026', time: '11:05:00', utr: 'YES2026030901105', status: 'Success', note: 'Escrow settlement complete' },
      { id: 'TXN-POOL-8800', path: 'Corporate Merchant -> Pool Account', amount: 'INR 95 Cr', date: 'Mar 8, 2026', time: '16:20:00', utr: 'CF2026030803321', status: 'Processing', note: 'Awaiting reconciliation' },
      { id: 'TXN-POOL-8799', path: 'Pool Account -> Investor Distribution', amount: 'INR 88 Cr', date: 'Mar 7, 2026', time: '12:45:00', utr: 'RAZ2026030701451', status: 'Success', note: 'Distributed to holders' },
    ],
  },
  'POOL-003': {
    summaryCards: [
      { title: 'Total Transactions (MTD)', value: '742', icon: 'solar:bill-list-bold' },
      { title: 'Success Rate', value: '96.8%', icon: 'solar:check-circle-bold' },
      { title: 'Failed Transactions', value: '24', icon: 'solar:close-circle-bold' },
    ],
    transactions: [
      { id: 'TXN-POOL-7701', path: 'Mixed Gateway -> Pool Account', amount: 'INR 140 Cr', date: 'Mar 9, 2026', time: '09:10:00', utr: 'PAY2026030900091', status: 'Success', note: 'Mixed pool inflow posted' },
      { id: 'TXN-POOL-7700', path: 'Investor Escrow (INV-003) -> SPV Escrow', amount: 'INR 50 Cr', date: 'Mar 8, 2026', time: '15:25:00', utr: 'N/A', status: 'Failed', note: 'Bank timeout on transfer' },
      { id: 'TXN-POOL-7699', path: 'Pool Account -> Investor Distribution', amount: 'INR 64 Cr', date: 'Mar 7, 2026', time: '13:05:00', utr: 'RAZ2026030702250', status: 'Success', note: 'Distribution settled' },
    ],
  },
  'POOL-101': {
    summaryCards: [
      { title: 'Total Transactions (MTD)', value: '861', icon: 'solar:bill-list-bold' },
      { title: 'Success Rate', value: '99.1%', icon: 'solar:check-circle-bold' },
      { title: 'Failed Transactions', value: '8', icon: 'solar:close-circle-bold' },
    ],
    transactions: [
      { id: 'TXN-POOL-6601', path: 'Gold Merchant -> Pool Account', amount: 'INR 160 Cr', date: 'Mar 9, 2026', time: '10:05:00', utr: 'RAZ2026030906601', status: 'Success', note: 'D0 same-day settlement' },
      { id: 'TXN-POOL-6600', path: 'Pool Account -> Investor Distribution', amount: 'INR 72 Cr', date: 'Mar 8, 2026', time: '18:15:00', utr: 'CF2026030806600', status: 'Success', note: 'Yield disbursed' },
    ],
  },
  'POOL-102': {
    summaryCards: [
      { title: 'Total Transactions (MTD)', value: '314', icon: 'solar:bill-list-bold' },
      { title: 'Success Rate', value: '93.4%', icon: 'solar:check-circle-bold' },
      { title: 'Failed Transactions', value: '11', icon: 'solar:close-circle-bold' },
    ],
    transactions: [
      { id: 'TXN-POOL-5501', path: 'Pending Merchant -> Pool Account', amount: 'INR 32 Cr', date: 'Mar 9, 2026', time: '12:05:00', utr: 'N/A', status: 'Pending', note: 'Pool activation pending' },
      { id: 'TXN-POOL-5500', path: 'Investor Escrow (INV-003) -> SPV Escrow', amount: 'INR 45 Cr', date: 'Mar 8, 2026', time: '11:20:00', utr: 'PHN2026030805500', status: 'Processing', note: 'Waiting for bank confirmation' },
    ],
  },
  'POOL-201': {
    summaryCards: [
      { title: 'Total Transactions (MTD)', value: '1,468', icon: 'solar:bill-list-bold' },
      { title: 'Success Rate', value: '98.9%', icon: 'solar:check-circle-bold' },
      { title: 'Failed Transactions', value: '16', icon: 'solar:close-circle-bold' },
    ],
    transactions: [
      { id: 'TXN-POOL-4401', path: 'MSME Merchant -> Pool Account', amount: 'INR 240 Cr', date: 'Mar 9, 2026', time: '09:50:00', utr: 'RAZ2026030904401', status: 'Success', note: 'Bulk MSME inflow' },
      { id: 'TXN-POOL-4400', path: 'Pool Account -> Investor Distribution', amount: 'INR 140 Cr', date: 'Mar 8, 2026', time: '17:40:00', utr: 'PAY2026030804400', status: 'Success', note: 'Series payout complete' },
      { id: 'TXN-POOL-4399', path: 'Gateway -> Escrow Reconciliation', amount: 'INR 18 Cr', date: 'Mar 7, 2026', time: '14:30:00', utr: 'N/A', status: 'Failed', note: 'Mismatch in settlement batch' },
    ],
  },
  'POOL-202': {
    summaryCards: [
      { title: 'Total Transactions (MTD)', value: '1,126', icon: 'solar:bill-list-bold' },
      { title: 'Success Rate', value: '97.1%', icon: 'solar:check-circle-bold' },
      { title: 'Failed Transactions', value: '23', icon: 'solar:close-circle-bold' },
    ],
    transactions: [
      { id: 'TXN-POOL-3301', path: 'D2 Merchant -> Pool Account', amount: 'INR 180 Cr', date: 'Mar 9, 2026', time: '08:55:00', utr: 'CF2026030903301', status: 'Success', note: 'D2 settlement received' },
      { id: 'TXN-POOL-3300', path: 'Pool Account -> Investor Distribution', amount: 'INR 95 Cr', date: 'Mar 8, 2026', time: '16:05:00', utr: 'RAZ2026030803300', status: 'Success', note: 'Distribution cycle closed' },
      { id: 'TXN-POOL-3299', path: 'Merchant Gateway -> Pool Account', amount: 'INR 11 Cr', date: 'Mar 7, 2026', time: '10:40:00', utr: 'N/A', status: 'Failed', note: 'Reversal from gateway' },
    ],
  },
  'POOL-203': {
    summaryCards: [
      { title: 'Total Transactions (MTD)', value: '694', icon: 'solar:bill-list-bold' },
      { title: 'Success Rate', value: '98.0%', icon: 'solar:check-circle-bold' },
      { title: 'Failed Transactions', value: '9', icon: 'solar:close-circle-bold' },
    ],
    transactions: [
      { id: 'TXN-POOL-2201', path: 'Mixed Retail Grid -> Pool Account', amount: 'INR 88 Cr', date: 'Mar 9, 2026', time: '10:15:00', utr: 'RAZ2026030902201', status: 'Success', note: 'Gateway inflow matched' },
      { id: 'TXN-POOL-2200', path: 'Pool Account -> Investor Distribution', amount: 'INR 55 Cr', date: 'Mar 8, 2026', time: '15:10:00', utr: 'PAY2026030802200', status: 'Success', note: 'PTC payout released' },
    ],
  },
  'POOL-301': {
    summaryCards: [
      { title: 'Total Transactions (MTD)', value: '188', icon: 'solar:bill-list-bold' },
      { title: 'Success Rate', value: '95.2%', icon: 'solar:check-circle-bold' },
      { title: 'Failed Transactions', value: '6', icon: 'solar:close-circle-bold' },
    ],
    transactions: [
      { id: 'TXN-POOL-1101', path: 'Closed Pool -> Investor Settlement', amount: 'INR 50 Cr', date: 'Mar 1, 2026', time: '13:20:00', utr: 'CF2026030101101', status: 'Success', note: 'Final closure payout' },
      { id: 'TXN-POOL-1100', path: 'Legacy Gateway -> Closure Account', amount: 'INR 8 Cr', date: 'Feb 28, 2026', time: '11:35:00', utr: 'N/A', status: 'Failed', note: 'Settlement rejected' },
    ],
  },
};

export const getPoolById = (id) => {
  const pool = POOL_DETAILS_DATA.find((item) => item.id === id);

  if (!pool) return undefined;

  return {
    ...pool,
    investorDetails: POOL_INVESTOR_DETAILS[id] || [],
    merchantsGateways: POOL_MERCHANTS_GATEWAYS[id] || [],
    gatewayDistribution: POOL_GATEWAY_DISTRIBUTION[id] || [],
    transactionFlowSummaryCards: POOL_TRANSACTION_FLOW[id]?.summaryCards || [],
    transactionFlowTransactions: POOL_TRANSACTION_FLOW[id]?.transactions || [],
  };
};
