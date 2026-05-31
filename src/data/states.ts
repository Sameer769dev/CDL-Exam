export interface StateDetails {
    code: string;
    name: string;
    manualUrl: string;
    appointmentUrl: string;
    permitFee: string;
    testFee: string;
    retestFee: string;
    notes?: string;
}

export const US_STATES: { code: string; name: string }[] = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
];

export const STATE_VERIFICATION_DATA: Record<string, StateDetails> = {
    AL: {
        code: 'AL',
        name: 'Alabama',
        manualUrl: 'https://www.alea.gov/sites/default/files/2023-01/CDLManual.pdf',
        appointmentUrl: 'https://dps.alabama.gov/DriverLicense',
        permitFee: '$36.25',
        testFee: '$20.00',
        retestFee: '$15.00',
        notes: 'Skills test requires third-party testing sites which may charge separate fees.'
    },
    AK: {
        code: 'AK',
        name: 'Alaska',
        manualUrl: 'https://doa.alaska.gov/dmv/manuals/pdfs/cdl.pdf',
        appointmentUrl: 'https://doa.alaska.gov/dmv/appointments.htm',
        permitFee: '$15.00',
        testFee: '$25.00',
        retestFee: '$25.00',
        notes: 'Road test fee is $100.00 if scheduled through Alaska DMV.'
    },
    AZ: {
        code: 'AZ',
        name: 'Arizona',
        manualUrl: 'https://azdot.gov/sites/default/files/2021/08/cdl-manual.pdf',
        appointmentUrl: 'https://azdot.gov/motor-vehicles/driver-services/commercial-driver-license-cdl',
        permitFee: '$25.00',
        testFee: '$10.00',
        retestFee: '$10.00',
        notes: 'Class A or B licenses carry different endorsement test fees.'
    },
    AR: {
        code: 'AR',
        name: 'Arkansas',
        manualUrl: 'https://www.dps.arkansas.gov/wp-content/uploads/2020/06/CDL_Manual_2015.pdf',
        appointmentUrl: 'https://www.dfa.arkansas.gov/driver-services',
        permitFee: '$50.00',
        testFee: '$0.00',
        retestFee: '$10.00',
        notes: 'Retest fees apply only after the first failed attempt.'
    },
    CA: {
        code: 'CA',
        name: 'California',
        manualUrl: 'https://www.dmv.ca.gov/portal/file/commercial-drivers-handbook-pdf/',
        appointmentUrl: 'https://www.dmv.ca.gov/portal/appointments/',
        permitFee: '$93.00',
        testFee: '$0.00',
        retestFee: '$39.00',
        notes: 'Permit fee covers up to three attempts for the knowledge tests.'
    },
    CO: {
        code: 'CO',
        name: 'Colorado',
        manualUrl: 'https://dmv.colorado.gov/sites/dmv/files/documents/CDL_Driver_Handbook_2022.pdf',
        appointmentUrl: 'https://dmv.colorado.gov/appointments',
        permitFee: '$20.80',
        testFee: '$0.00',
        retestFee: '$15.00',
        notes: 'Third-party testing is required for the driving skills exam.'
    },
    CT: {
        code: 'CT',
        name: 'Connecticut',
        manualUrl: 'https://portal.ct.gov/-/media/dmv/20/29/cdlmanualpdf.pdf',
        appointmentUrl: 'https://portal.ct.gov/DMV/Licenses/Licenses/Commercial-Drivers-License',
        permitFee: '$30.00',
        testFee: '$16.00',
        retestFee: '$16.00',
        notes: 'Skills test is $85.00 and must be scheduled online.'
    },
    DE: {
        code: 'DE',
        name: 'Delaware',
        manualUrl: 'https://dmv.de.gov/forms/veh_serv_forms/pdfs/cdl_manual.pdf',
        appointmentUrl: 'https://dmv.de.gov/services/driver_services/index.shtml',
        permitFee: '$40.00',
        testFee: '$0.00',
        retestFee: '$10.00',
        notes: 'Permit is valid for 1 year from date of issue.'
    },
    FL: {
        code: 'FL',
        name: 'Florida',
        manualUrl: 'https://www.flhsmv.gov/pdf/handbooks/englishcdlhandbook.pdf',
        appointmentUrl: 'https://www.flhsmv.gov/locations/',
        permitFee: '$75.00',
        testFee: '$0.00',
        retestFee: '$10.00',
        notes: 'Each endorsement exam retest fee is $10.00.'
    },
    GA: {
        code: 'GA',
        name: 'Georgia',
        manualUrl: 'https://dds.georgia.gov/document/manual/commercial-drivers-manual-cdl/download',
        appointmentUrl: 'https://dds.georgia.gov/appointments',
        permitFee: '$35.00',
        testFee: '$20.00',
        retestFee: '$10.00',
        notes: 'Road test fee is $50.00 and must be paid in advance.'
    },
    HI: {
        code: 'HI',
        name: 'Hawaii',
        manualUrl: 'https://hidot.hawaii.gov/highways/files/2019/02/HI-CDL-Manual-2015.pdf',
        appointmentUrl: 'https://hidot.hawaii.gov/highways/library/motor-vehicle-safety-office/',
        permitFee: '$30.00',
        testFee: '$15.00',
        retestFee: '$15.00',
        notes: 'Fees may vary slightly by county (Oahu, Maui, Hawaii, Kauai).'
    },
    ID: {
        code: 'ID',
        name: 'Idaho',
        manualUrl: 'https://itd.idaho.gov/wp-content/uploads/2016/06/cdl_manual.pdf',
        appointmentUrl: 'https://itd.idaho.gov/itddmv/',
        permitFee: '$29.00',
        testFee: '$3.00',
        retestFee: '$15.00',
        notes: 'Skills test is $70.00 paid directly to the examiner.'
    },
    IL: {
        code: 'IL',
        name: 'Illinois',
        manualUrl: 'https://www.ilsos.gov/publications/pdf_publications/dsd_cdl2.pdf',
        appointmentUrl: 'https://www.ilsos.gov/departments/drivers/drivers_license/CDL/home.html',
        permitFee: '$50.00',
        testFee: '$0.00',
        retestFee: '$24.00',
        notes: 'Standard permit fee covers initial testing attempts.'
    },
    IN: {
        code: 'IN',
        name: 'Indiana',
        manualUrl: 'https://www.in.gov/bmv/files/CDL_Manual.pdf',
        appointmentUrl: 'https://www.in.gov/bmv/resources/appointments/',
        permitFee: '$17.00',
        testFee: '$0.00',
        retestFee: '$10.00',
        notes: 'Skills tests are conducted by third-party providers.'
    },
    IA: {
        code: 'IA',
        name: 'Iowa',
        manualUrl: 'https://iowadot.gov/mvd/handbooks/cdl.pdf',
        appointmentUrl: 'https://iowadot.gov/mvd/ods/appointments',
        permitFee: '$12.00',
        testFee: '$0.00',
        retestFee: '$15.00',
        notes: 'Skills test fee is $25.00 if taken at Iowa DMV.'
    },
    KS: {
        code: 'KS',
        name: 'Kansas',
        manualUrl: 'https://www.ksrevenue.gov/pdf/cdlman.pdf',
        appointmentUrl: 'https://www.ksrevenue.gov/dovappointments.html',
        permitFee: '$13.00',
        testFee: '$0.00',
        retestFee: '$10.00',
        notes: 'Commercial license fee is $44.00 upon passing.'
    },
    KY: {
        code: 'KY',
        name: 'Kentucky',
        manualUrl: 'https://drive.ky.gov/handbooks/Documents/Commercial%20Driver%20License%20Manual.pdf',
        appointmentUrl: 'https://drive.ky.gov/pages/appointments.aspx',
        permitFee: '$35.00',
        testFee: '$50.00',
        retestFee: '$50.00',
        notes: 'Application fee is $50.00, which covers initial testing.'
    },
    LA: {
        code: 'LA',
        name: 'Louisiana',
        manualUrl: 'https://www.expresslane.org/media/1xdfj2u5/cdl_manual.pdf',
        appointmentUrl: 'https://www.expresslane.org/appointments/',
        permitFee: '$15.00',
        testFee: '$0.00',
        retestFee: '$15.00',
        notes: 'Third-party skills exam fees typically range from $100 to $200.'
    },
    ME: {
        code: 'ME',
        name: 'Maine',
        manualUrl: 'https://www.maine.gov/sos/bmv/licenses/cdlmanual.pdf',
        appointmentUrl: 'https://www.maine.gov/sos/bmv/locations/index.html',
        permitFee: '$10.00',
        testFee: '$70.00',
        retestFee: '$30.00',
        notes: 'Test fee covers both skills and knowledge tests.'
    },
    MD: {
        code: 'MD',
        name: 'Maryland',
        manualUrl: 'https://mva.maryland.gov/drivers/Documents/cdl-manual.pdf',
        appointmentUrl: 'https://mva.maryland.gov/Pages/default.aspx',
        permitFee: '$90.00',
        testFee: '$0.00',
        retestFee: '$20.00',
        notes: 'Permit fee includes the initial skills test attempt.'
    },
    MA: {
        code: 'MA',
        name: 'Massachusetts',
        manualUrl: 'https://www.mass.gov/doc/commercial-drivers-license-manual-0/download',
        appointmentUrl: 'https://www.mass.gov/myrmv',
        permitFee: '$30.00',
        testFee: '$30.00',
        retestFee: '$30.00',
        notes: 'Road skills test fee is $150.00 per attempt.'
    },
    MI: {
        code: 'MI',
        name: 'Michigan',
        manualUrl: 'https://www.michigan.gov/sos/-/media/Project/Websites/sos/01doc/cdlmanl.pdf',
        appointmentUrl: 'https://www.michigan.gov/sos/resources/scheduling-an-appointment',
        permitFee: '$25.00',
        testFee: '$0.00',
        retestFee: '$15.00',
        notes: 'Endorsement add-on fees are $5.00 per category.'
    },
    MN: {
        code: 'MN',
        name: 'Minnesota',
        manualUrl: 'https://dps.mn.gov/divisions/dvs/forms-documents/Documents/CDLManual.pdf',
        appointmentUrl: 'https://dps.mn.gov/divisions/dvs/locations/Pages/default.aspx',
        permitFee: '$10.50',
        testFee: '$0.00',
        retestFee: '$20.00',
        notes: 'Road skills test is scheduled through state-certified examiners.'
    },
    MS: {
        code: 'MS',
        name: 'Mississippi',
        manualUrl: 'https://www.driverservicebureau.dps.ms.gov/sites/default/files/2019-09/MS%20CDL%20Manual.pdf',
        appointmentUrl: 'https://www.driverservicebureau.dps.ms.gov/',
        permitFee: '$25.00',
        testFee: '$0.00',
        retestFee: '$15.00',
        notes: 'Application processing fee of $25.00 is non-refundable.'
    },
    MO: {
        code: 'MO',
        name: 'Missouri',
        manualUrl: 'https://dor.mo.gov/pdf/cdlman.pdf',
        appointmentUrl: 'https://dor.mo.gov/driver-license/issuance/commercial/',
        permitFee: '$16.00',
        testFee: '$0.00',
        retestFee: '$10.00',
        notes: 'Testing is administered by the Missouri State Highway Patrol.'
    },
    MT: {
        code: 'MT',
        name: 'Montana',
        manualUrl: 'https://dojmt.gov/wp-content/uploads/2018/06/cdlmanual.pdf',
        appointmentUrl: 'https://dojmt.gov/driving/driver-licensing/',
        permitFee: '$25.00',
        testFee: '$20.00',
        retestFee: '$15.00',
        notes: 'Verification of state residence is strict at check-in.'
    },
    NE: {
        code: 'NE',
        name: 'Nebraska',
        manualUrl: 'https://dmv.nebraska.gov/sites/dmv.nebraska.gov/files/files/image/CDLmanual.pdf',
        appointmentUrl: 'https://dmv.nebraska.gov/locations',
        permitFee: '$12.50',
        testFee: '$0.00',
        retestFee: '$10.00',
        notes: 'Losing permit results in a replacement fee of $12.50.'
    },
    NV: {
        code: 'NV',
        name: 'Nevada',
        manualUrl: 'https://dmv.nv.gov/pdffiles/dlhandbookcdl.pdf',
        appointmentUrl: 'https://dmv.nv.gov/appointments.htm',
        permitFee: '$57.25',
        testFee: '$0.00',
        retestFee: '$30.00',
        notes: 'Skills test is $30.00, which must be prepaid.'
    },
    NH: {
        code: 'NH',
        name: 'New Hampshire',
        manualUrl: 'https://www.dmv.nh.gov/sites/g/files/ehbemt401/files/inline-documents/documents/cdl-manual.pdf',
        appointmentUrl: 'https://www.dmv.nh.gov/drivers-licensing/commercial-driver-license',
        permitFee: '$30.00',
        testFee: '$0.00',
        retestFee: '$20.00',
        notes: 'General CDL fee is $60.00 once knowledge exams are passed.'
    },
    NJ: {
        code: 'NJ',
        name: 'New Jersey',
        manualUrl: 'https://www.state.nj.us/mvc/pdf/license/cdlmanual.pdf',
        appointmentUrl: 'https://www.state.nj.us/mvc/locations/licopt.htm',
        permitFee: '$125.00',
        testFee: '$0.00',
        retestFee: '$15.00',
        notes: 'Includes CDL manual purchase fee if bought physically at MVC.'
    },
    NM: {
        code: 'NM',
        name: 'New Mexico',
        manualUrl: 'https://www.mvd.newmexico.gov/wp-content/uploads/2020/12/cdl_manual.pdf',
        appointmentUrl: 'https://www.mvd.newmexico.gov/appointments/',
        permitFee: '$15.00',
        testFee: '$0.00',
        retestFee: '$15.00',
        notes: 'Skills testing is contracted to state-registered schools.'
    },
    NY: {
        code: 'NY',
        name: 'New York',
        manualUrl: 'https://dmv.ny.gov/brochure/cdl10.pdf',
        appointmentUrl: 'https://dmv.ny.gov/appointments',
        permitFee: '$10.00',
        testFee: '$40.00',
        retestFee: '$40.00',
        notes: 'Skills exam requires booking after passing written tests.'
    },
    NC: {
        code: 'NC',
        name: 'North Carolina',
        manualUrl: 'https://www.ncdot.gov/dmv/downloads/Documents/CDL_Manual.pdf',
        appointmentUrl: 'https://www.ncdot.gov/dmv/license-id/driver-licenses/commercial/Pages/default.aspx',
        permitFee: '$43.25',
        testFee: '$21.50',
        retestFee: '$20.00',
        notes: 'Permit fees must be paid at time of application.'
    },
    ND: {
        code: 'ND',
        name: 'North Dakota',
        manualUrl: 'https://www.dot.nd.gov/divisions/driverslicense/docs/cdl-manual.pdf',
        appointmentUrl: 'https://www.dot.nd.gov/divisions/driverslicense/dlts.htm',
        permitFee: '$15.00',
        testFee: '$5.00',
        retestFee: '$5.00',
        notes: 'Endorsement exams cost $5.00 per attempt.'
    },
    OH: {
        code: 'OH',
        name: 'Ohio',
        manualUrl: 'https://publicsafety.ohio.gov/static/bmv2654.pdf',
        appointmentUrl: 'https://www.bmv.ohio.gov/dl-cdl-scheduled.aspx',
        permitFee: '$27.50',
        testFee: '$0.00',
        retestFee: '$10.00',
        notes: 'Knowledge test is free on the first attempt at deputy registrars.'
    },
    OK: {
        code: 'OK',
        name: 'Oklahoma',
        manualUrl: 'https://oklahoma.gov/content/dam/ok/en/dps/docs/cdl-manual.pdf',
        appointmentUrl: 'https://oklahoma.gov/dps.html',
        permitFee: '$25.00',
        testFee: '$0.00',
        retestFee: '$10.00',
        notes: 'Written test retakes are limited to once per calendar day.'
    },
    OR: {
        code: 'OR',
        name: 'Oregon',
        manualUrl: 'https://www.oregon.gov/odot/DMV/DriverManuals/CDL_Manual.pdf',
        appointmentUrl: 'https://www.oregon.gov/odot/dmv/pages/index.aspx',
        permitFee: '$23.50',
        testFee: '$10.00',
        retestFee: '$10.00',
        notes: 'Skills test is $75.00 if taken directly with Oregon DMV.'
    },
    PA: {
        code: 'PA',
        name: 'Pennsylvania',
        manualUrl: 'https://www.dmv.pa.gov/Driver-Services/Commercial-Driver/Documents/pub-223.pdf',
        appointmentUrl: 'https://www.dmv.pa.gov/Driver-Services/Commercial-Driver/Pages/default.aspx',
        permitFee: '$90.00',
        testFee: '$0.00',
        retestFee: '$30.00',
        notes: 'Skills test scheduling is free if taken at a PennDOT center.'
    },
    RI: {
        code: 'RI',
        name: 'Rhode Island',
        manualUrl: 'https://dmv.ri.gov/sites/g/files/ehbemt506/files/2022-05/CDLManual.pdf',
        appointmentUrl: 'https://dmv.ri.gov/licenses-permits/commercial-driver-license-cdl',
        permitFee: '$11.50',
        testFee: '$10.00',
        retestFee: '$10.00',
        notes: 'Skills road test is $100.00 per attempt.'
    },
    SC: {
        code: 'SC',
        name: 'South Carolina',
        manualUrl: 'https://scdmvonline.com/-/media/Files/CDL-Manual.ashx',
        appointmentUrl: 'https://scdmvonline.com/Driver-Services/Commercial-Licenses',
        permitFee: '$15.00',
        testFee: '$2.00',
        retestFee: '$2.00',
        notes: 'Knowledge test fee is $2.00 per application attempt.'
    },
    SD: {
        code: 'SD',
        name: 'South Dakota',
        manualUrl: 'https://dps.sd.gov/application/files/8416/5419/5598/CDL_Manual_2015.pdf',
        appointmentUrl: 'https://dps.sd.gov/driver-licensing',
        permitFee: '$33.00',
        testFee: '$0.00',
        retestFee: '$15.00',
        notes: 'Permit is valid for 180 days with one renewal allowed.'
    },
    TN: {
        code: 'TN',
        name: 'Tennessee',
        manualUrl: 'https://www.tn.gov/content/dam/tn/safety/documents/cdlmanual.pdf',
        appointmentUrl: 'https://www.tn.gov/safety/driver-services/online.html',
        permitFee: '$14.00',
        testFee: '$0.00',
        retestFee: '$12.00',
        notes: 'Knowledge tests are conducted on touch-screen computers at center.'
    },
    TX: {
        code: 'TX',
        name: 'Texas',
        manualUrl: 'https://www.dps.texas.gov/internetforms/Forms/DL-7C.pdf',
        appointmentUrl: 'https://www.dps.texas.gov/section/driver-license/commercial-driver-license-cdl',
        permitFee: '$97.00',
        testFee: '$0.00',
        retestFee: '$11.00',
        notes: 'Permit is valid for up to 180 days or until the applicant turns 18.'
    },
    UT: {
        code: 'UT',
        name: 'Utah',
        manualUrl: 'https://dld.utah.gov/wp-content/uploads/sites/17/2021/04/CDL-Handbook-2017.pdf',
        appointmentUrl: 'https://dld.utah.gov/appointments/',
        permitFee: '$52.00',
        testFee: '$0.00',
        retestFee: '$20.00',
        notes: 'Written exam allows up to two attempts per payment.'
    },
    VT: {
        code: 'VT',
        name: 'Vermont',
        manualUrl: 'https://dmv.vermont.gov/sites/dmv/files/documents/VN-011-CDL_Manual.pdf',
        appointmentUrl: 'https://dmv.vermont.gov/licenses/scheduling-an-appointment',
        permitFee: '$20.00',
        testFee: '$32.00',
        retestFee: '$20.00',
        notes: 'Road skills test fee is $32.00 per attempt.'
    },
    VA: {
        code: 'VA',
        name: 'Virginia',
        manualUrl: 'https://www.dmv.virginia.gov/webdoc/pdf/dmv60.pdf',
        appointmentUrl: 'https://www.dmv.virginia.gov/appointments',
        permitFee: '$3.00',
        testFee: '$10.00',
        retestFee: '$2.00',
        notes: 'General application fee is $10.00, plus annual license fees.'
    },
    WA: {
        code: 'WA',
        name: 'Washington',
        manualUrl: 'https://www.dol.wa.gov/driverslicense/docs/cdlguide.pdf',
        appointmentUrl: 'https://www.dol.wa.gov/appointments/',
        permitFee: '$40.00',
        testFee: '$35.00',
        retestFee: '$35.00',
        notes: 'Skills test is administered by third-party organizations only.'
    },
    WV: {
        code: 'WV',
        name: 'West Virginia',
        manualUrl: 'https://transportation.wv.gov/dmv/Drivers/Documents/CDL%20Manual.pdf',
        appointmentUrl: 'https://transportation.wv.gov/dmv/appointments/Pages/default.aspx',
        permitFee: '$25.00',
        testFee: '$0.00',
        retestFee: '$10.00',
        notes: 'Written knowledge test consists of 50 questions.'
    },
    WI: {
        code: 'WI',
        name: 'Wisconsin',
        manualUrl: 'https://wisconsindot.gov/documents/dmv/shared/cdl-manual.pdf',
        appointmentUrl: 'https://wisconsindot.gov/Pages/dmv/license-drvs/how-to-apply/appt.aspx',
        permitFee: '$30.00',
        testFee: '$0.00',
        retestFee: '$15.00',
        notes: 'Commercial license upgrade fee is $74.00.'
    },
    WY: {
        code: 'WY',
        name: 'Wyoming',
        manualUrl: 'https://www.dot.state.wy.us/files/live/sites/wydot/files/shared/Driver_Services/Manuals/CDL%20Manual%202021.pdf',
        appointmentUrl: 'http://www.dot.state.wy.us/home/driver_license_locations.html',
        permitFee: '$40.00',
        testFee: '$0.00',
        retestFee: '$15.00',
        notes: 'Road test fee is $40.00 if booked with state troopers.'
    }
};
