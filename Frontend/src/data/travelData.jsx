import React from 'react';

export const AIRPORTS = [
  // Andhra Pradesh
  { code: 'VTZ', city: 'Visakhapatnam, Andhra Pradesh', iataCode: 'VTZ', name: 'Visakhapatnam International Airport', state: 'Andhra Pradesh', country: 'India' },
  { code: 'VGA', city: 'Vijayawada, Andhra Pradesh', iataCode: 'VGA', name: 'Vijayawada International Airport', state: 'Andhra Pradesh', country: 'India' },
  { code: 'TIR', city: 'Tirupati, Andhra Pradesh', iataCode: 'TIR', name: 'Tirupati International Airport', state: 'Andhra Pradesh', country: 'India' },
  { code: 'RJA', city: 'Rajahmundry, Andhra Pradesh', iataCode: 'RJA', name: 'Rajahmundry Airport', state: 'Andhra Pradesh', country: 'India' },

  // Arunachal Pradesh
  { code: 'HGI', city: 'Itanagar, Arunachal Pradesh', iataCode: 'HGI', name: 'Donyi Polo Airport', state: 'Arunachal Pradesh', country: 'India' },
  { code: 'IXT', city: 'Pasighat, Arunachal Pradesh', iataCode: 'IXT', name: 'Pasighat Airport', state: 'Arunachal Pradesh', country: 'India' },

  // Assam
  { code: 'GAU', city: 'Guwahati, Assam', iataCode: 'GAU', name: 'Lokpriya Gopinath Bordoloi Intl Airport', state: 'Assam', country: 'India' },
  { code: 'DIB', city: 'Dibrugarh, Assam', iataCode: 'DIB', name: 'Dibrugarh Airport', state: 'Assam', country: 'India' },
  { code: 'IXS', city: 'Silchar, Assam', iataCode: 'IXS', name: 'Silchar Airport', state: 'Assam', country: 'India' },
  { code: 'JRH', city: 'Jorhat, Assam', iataCode: 'JRH', name: 'Jorhat Airport', state: 'Assam', country: 'India' },

  // Bihar
  { code: 'PAT', city: 'Patna, Bihar', iataCode: 'PAT', name: 'Jayprakash Narayan International Airport', state: 'Bihar', country: 'India' },
  { code: 'GAY', city: 'Gaya, Bihar', iataCode: 'GAY', name: 'Gaya International Airport', state: 'Bihar', country: 'India' },
  { code: 'DBR', city: 'Darbhanga, Bihar', iataCode: 'DBR', name: 'Darbhanga Airport', state: 'Bihar', country: 'India' },

  // Chhattisgarh
  { code: 'RPR', city: 'Raipur, Chhattisgarh', iataCode: 'RPR', name: 'Swami Vivekananda Airport', state: 'Chhattisgarh', country: 'India' },

  // Delhi (NCT)
  { code: 'DEL', city: 'New Delhi, Delhi', iataCode: 'DEL', name: 'Indira Gandhi International Airport', state: 'Delhi', country: 'India' },

  // Goa
  { code: 'GOI', city: 'Dabolim, Goa', iataCode: 'GOI', name: 'Dabolim Airport', state: 'Goa', country: 'India' },
  { code: 'GOX', city: 'Mopa, Goa', iataCode: 'GOX', name: 'Manohar International Airport', state: 'Goa', country: 'India' },

  // Gujarat
  { code: 'AMD', city: 'Ahmedabad, Gujarat', iataCode: 'AMD', name: 'Sardar Vallabhbhai Patel Intl Airport', state: 'Gujarat', country: 'India' },
  { code: 'STV', city: 'Surat, Gujarat', iataCode: 'STV', name: 'Surat International Airport', state: 'Gujarat', country: 'India' },
  { code: 'BDQ', city: 'Vadodara, Gujarat', iataCode: 'BDQ', name: 'Vadodara Airport', state: 'Gujarat', country: 'India' },
  { code: 'HSR', city: 'Rajkot, Gujarat', iataCode: 'HSR', name: 'Rajkot International Airport', state: 'Gujarat', country: 'India' },
  { code: 'BHJ', city: 'Bhuj, Gujarat', iataCode: 'BHJ', name: 'Bhuj Airport', state: 'Gujarat', country: 'India' },

  // Haryana / Punjab / Chandigarh
  { code: 'IXC', city: 'Chandigarh / Mohali', iataCode: 'IXC', name: 'Shaheed Bhagat Singh Intl Airport', state: 'Chandigarh / Punjab / Haryana', country: 'India' },

  // Himachal Pradesh
  { code: 'DHM', city: 'Dharamshala, Himachal Pradesh', iataCode: 'DHM', name: 'Kangra Gaggal Airport', state: 'Himachal Pradesh', country: 'India' },
  { code: 'KUU', city: 'Kullu Manali, Himachal Pradesh', iataCode: 'KUU', name: 'Bhuntar Airport', state: 'Himachal Pradesh', country: 'India' },
  { code: 'SLV', city: 'Shimla, Himachal Pradesh', iataCode: 'SLV', name: 'Shimla Jubbarhatti Airport', state: 'Himachal Pradesh', country: 'India' },

  // Jammu & Kashmir
  { code: 'SXR', city: 'Srinagar, Jammu & Kashmir', iataCode: 'SXR', name: 'Sheikh ul-Alam International Airport', state: 'Jammu & Kashmir', country: 'India' },
  { code: 'IXJ', city: 'Jammu, Jammu & Kashmir', iataCode: 'IXJ', name: 'Jammu Civil Enclave', state: 'Jammu & Kashmir', country: 'India' },

  // Jharkhand
  { code: 'IXR', city: 'Ranchi, Jharkhand', iataCode: 'IXR', name: 'Birsa Munda Airport', state: 'Jharkhand', country: 'India' },
  { code: 'DGH', city: 'Deoghar, Jharkhand', iataCode: 'DGH', name: 'Deoghar Airport', state: 'Jharkhand', country: 'India' },

  // Karnataka
  { code: 'BLR', city: 'Bengaluru, Karnataka', iataCode: 'BLR', name: 'Kempegowda International Airport', state: 'Karnataka', country: 'India' },
  { code: 'IXE', city: 'Mangaluru, Karnataka', iataCode: 'IXE', name: 'Mangaluru International Airport', state: 'Karnataka', country: 'India' },
  { code: 'HBX', city: 'Hubballi, Karnataka', iataCode: 'HBX', name: 'Hubballi Airport', state: 'Karnataka', country: 'India' },
  { code: 'IXG', city: 'Belagavi, Karnataka', iataCode: 'IXG', name: 'Belagavi Airport', state: 'Karnataka', country: 'India' },
  { code: 'MYQ', city: 'Mysuru, Karnataka', iataCode: 'MYQ', name: 'Mysore Airport', state: 'Karnataka', country: 'India' },

  // Kerala
  { code: 'COK', city: 'Kochi, Kerala', iataCode: 'COK', name: 'Cochin International Airport', state: 'Kerala', country: 'India' },
  { code: 'TRV', city: 'Thiruvananthapuram, Kerala', iataCode: 'TRV', name: 'Trivandrum International Airport', state: 'Kerala', country: 'India' },
  { code: 'CCJ', city: 'Kozhikode, Kerala', iataCode: 'CCJ', name: 'Calicut International Airport', state: 'Kerala', country: 'India' },
  { code: 'CNN', city: 'Kannur, Kerala', iataCode: 'CNN', name: 'Kannur International Airport', state: 'Kerala', country: 'India' },

  // Ladakh
  { code: 'IXL', city: 'Leh, Ladakh', iataCode: 'IXL', name: 'Kushok Bakula Rimpochee Airport', state: 'Ladakh', country: 'India' },

  // Madhya Pradesh
  { code: 'IDR', city: 'Indore, Madhya Pradesh', iataCode: 'IDR', name: 'Devi Ahilya Bai Holkar Airport', state: 'Madhya Pradesh', country: 'India' },
  { code: 'BHO', city: 'Bhopal, Madhya Pradesh', iataCode: 'BHO', name: 'Raja Bhoj Airport', state: 'Madhya Pradesh', country: 'India' },
  { code: 'GWL', city: 'Gwalior, Madhya Pradesh', iataCode: 'GWL', name: 'Rajmata Vijaya Raje Scindia Airport', state: 'Madhya Pradesh', country: 'India' },
  { code: 'JLR', city: 'Jabalpur, Madhya Pradesh', iataCode: 'JLR', name: 'Jabalpur Airport', state: 'Madhya Pradesh', country: 'India' },

  // Maharashtra
  { code: 'BOM', city: 'Mumbai, Maharashtra', iataCode: 'BOM', name: 'Chhatrapati Shivaji Maharaj Intl Airport', state: 'Maharashtra', country: 'India' },
  { code: 'PNQ', city: 'Pune, Maharashtra', iataCode: 'PNQ', name: 'Pune International Airport', state: 'Maharashtra', country: 'India' },
  { code: 'NAG', city: 'Nagpur, Maharashtra', iataCode: 'NAG', name: 'Dr. Babasaheb Ambedkar Intl Airport', state: 'Maharashtra', country: 'India' },
  { code: 'SAG', city: 'Shirdi, Maharashtra', iataCode: 'SAG', name: 'Shirdi Airport', state: 'Maharashtra', country: 'India' },
  { code: 'ISK', city: 'Nashik, Maharashtra', iataCode: 'ISK', name: 'Nashik Ozar Airport', state: 'Maharashtra', country: 'India' },
  { code: 'IXU', city: 'Chhatrapati Sambhaji Nagar, Maharashtra', iataCode: 'IXU', name: 'Aurangabad Airport', state: 'Maharashtra', country: 'India' },

  // Manipur
  { code: 'IMF', city: 'Imphal, Manipur', iataCode: 'IMF', name: 'Bir Tikendrajit International Airport', state: 'Manipur', country: 'India' },

  // Meghalaya
  { code: 'SHL', city: 'Shillong, Meghalaya', iataCode: 'SHL', name: 'Umroi Airport', state: 'Meghalaya', country: 'India' },

  // Mizoram
  { code: 'AJL', city: 'Aizawl, Mizoram', iataCode: 'AJL', name: 'Lengpui Airport', state: 'Mizoram', country: 'India' },

  // Nagaland
  { code: 'DMU', city: 'Dimapur, Nagaland', iataCode: 'DMU', name: 'Dimapur Airport', state: 'Nagaland', country: 'India' },

  // Odisha
  { code: 'BBI', city: 'Bhubaneswar, Odisha', iataCode: 'BBI', name: 'Biju Patnaik International Airport', state: 'Odisha', country: 'India' },
  { code: 'JRG', city: 'Jharsuguda, Odisha', iataCode: 'JRG', name: 'Veer Surendra Sai Airport', state: 'Odisha', country: 'India' },

  // Punjab
  { code: 'ATQ', city: 'Amritsar, Punjab', iataCode: 'ATQ', name: 'Sri Guru Ram Dass Jee Intl Airport', state: 'Punjab', country: 'India' },

  // Rajasthan
  { code: 'JAI', city: 'Jaipur, Rajasthan', iataCode: 'JAI', name: 'Jaipur International Airport', state: 'Rajasthan', country: 'India' },
  { code: 'UDR', city: 'Udaipur, Rajasthan', iataCode: 'UDR', name: 'Maharana Pratap Airport', state: 'Rajasthan', country: 'India' },
  { code: 'JDH', city: 'Jodhpur, Rajasthan', iataCode: 'JDH', name: 'Jodhpur Airport', state: 'Rajasthan', country: 'India' },
  { code: 'JSA', city: 'Jaisalmer, Rajasthan', iataCode: 'JSA', name: 'Jaisalmer Airport', state: 'Rajasthan', country: 'India' },

  // Sikkim
  { code: 'PYG', city: 'Pakyong (Gangtok), Sikkim', iataCode: 'PYG', name: 'Pakyong Airport', state: 'Sikkim', country: 'India' },

  // Tamil Nadu
  { code: 'MAA', city: 'Chennai, Tamil Nadu', iataCode: 'MAA', name: 'Chennai International Airport', state: 'Tamil Nadu', country: 'India' },
  { code: 'CJB', city: 'Coimbatore, Tamil Nadu', iataCode: 'CJB', name: 'Coimbatore International Airport', state: 'Tamil Nadu', country: 'India' },
  { code: 'IXM', city: 'Madurai, Tamil Nadu', iataCode: 'IXM', name: 'Madurai Airport', state: 'Tamil Nadu', country: 'India' },
  { code: 'TRZ', city: 'Tiruchirappalli, Tamil Nadu', iataCode: 'TRZ', name: 'Tiruchirappalli Intl Airport', state: 'Tamil Nadu', country: 'India' },

  // Telangana
  { code: 'HYD', city: 'Hyderabad, Telangana', iataCode: 'HYD', name: 'Rajiv Gandhi International Airport', state: 'Telangana', country: 'India' },

  // Tripura
  { code: 'IXA', city: 'Agartala, Tripura', iataCode: 'IXA', name: 'Maharaja Bir Bikram Airport', state: 'Tripura', country: 'India' },

  // Uttar Pradesh
  { code: 'LKO', city: 'Lucknow, Uttar Pradesh', iataCode: 'LKO', name: 'Chaudhary Charan Singh Intl Airport', state: 'Uttar Pradesh', country: 'India' },
  { code: 'VNS', city: 'Varanasi, Uttar Pradesh', iataCode: 'VNS', name: 'Lal Bahadur Shastri Intl Airport', state: 'Uttar Pradesh', country: 'India' },
  { code: 'AYJ', city: 'Ayodhya, Uttar Pradesh', iataCode: 'AYJ', name: 'Maharishi Valmiki International Airport', state: 'Uttar Pradesh', country: 'India' },
  { code: 'KNU', city: 'Kanpur, Uttar Pradesh', iataCode: 'KNU', name: 'Kanpur Airport', state: 'Uttar Pradesh', country: 'India' },
  { code: 'IXD', city: 'Prayagraj, Uttar Pradesh', iataCode: 'IXD', name: 'Prayagraj Airport', state: 'Uttar Pradesh', country: 'India' },

  // Uttarakhand
  { code: 'DED', city: 'Dehradun, Uttarakhand', iataCode: 'DED', name: 'Jolly Grant Airport', state: 'Uttarakhand', country: 'India' },
  { code: 'PGH', city: 'Pantnagar, Uttarakhand', iataCode: 'PGH', name: 'Pantnagar Airport', state: 'Uttarakhand', country: 'India' },

  // West Bengal
  { code: 'CCU', city: 'Kolkata, West Bengal', iataCode: 'CCU', name: 'Netaji Subhash Chandra Bose Intl Airport', state: 'West Bengal', country: 'India' },
  { code: 'IXB', city: 'Bagdogra / Siliguri, West Bengal', iataCode: 'IXB', name: 'Bagdogra Airport', state: 'West Bengal', country: 'India' },
  { code: 'RGD', city: 'Durgapur, West Bengal', iataCode: 'RGD', name: 'Kazi Nazrul Islam Airport', state: 'West Bengal', country: 'India' },

  // Union Territories
  { code: 'IXZ', city: 'Port Blair, Andaman & Nicobar', iataCode: 'IXZ', name: 'Veer Savarkar Intl Airport', state: 'Andaman & Nicobar Islands', country: 'India' },
  { code: 'AGX', city: 'Agatti Island, Lakshadweep', iataCode: 'AGX', name: 'Agatti Airport', state: 'Lakshadweep', country: 'India' },
  { code: 'PNY', city: 'Puducherry, Puducherry', iataCode: 'PNY', name: 'Puducherry Airport', state: 'Puducherry', country: 'India' },
  { code: 'DIU', city: 'Diu, Daman & Diu', iataCode: 'DIU', name: 'Diu Airport', state: 'Daman & Diu', country: 'India' },

  // International Destinations
  { code: 'DXB', city: 'Dubai, UAE', iataCode: 'DXB', name: 'Dubai International Airport', state: 'UAE', country: 'UAE' },
  { code: 'SIN', city: 'Singapore', iataCode: 'SIN', name: 'Changi Airport', state: 'Singapore', country: 'Singapore' },
  { code: 'LHR', city: 'London, UK', iataCode: 'LHR', name: 'Heathrow Airport', state: 'UK', country: 'UK' },
  { code: 'BKK', city: 'Bangkok, Thailand', iataCode: 'BKK', name: 'Suvarnabhumi Airport', state: 'Thailand', country: 'Thailand' }
];

// Vector SVG Airline Logos
export const AIRLINE_LOGOS = {
  AI: (
    <svg width="36" height="36" style={{ width: '36px', height: '36px', minWidth: '36px' }} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#D91B24" />
      <path d="M10 24L30 14L24 28L20 22L14 24L10 24Z" fill="#FFC72C" />
      <circle cx="27" cy="15" r="2" fill="#FFFFFF" />
    </svg>
  ),
  '6E': (
    <svg width="36" height="36" style={{ width: '36px', height: '36px', minWidth: '36px' }} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#002B66" />
      <text x="7" y="27" fill="#00A3E0" fontSize="18" fontWeight="bold" fontFamily="sans-serif">6E</text>
    </svg>
  ),
  UK: (
    <svg width="36" height="36" style={{ width: '36px', height: '36px', minWidth: '36px' }} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#4A154B" />
      <path d="M20 8L23.5 16.5L32 20L23.5 23.5L20 32L16.5 23.5L8 20L16.5 16.5L20 8Z" fill="#E89923" />
    </svg>
  ),
  SG: (
    <svg width="36" height="36" style={{ width: '36px', height: '36px', minWidth: '36px' }} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#E31837" />
      <path d="M12 28C12 28 16 12 28 12C28 12 22 24 12 28Z" fill="#FF6B00" />
      <circle cx="28" cy="12" r="3" fill="#FFFFFF" />
    </svg>
  ),
  QP: (
    <svg width="36" height="36" style={{ width: '36px', height: '36px', minWidth: '36px' }} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#FF5000" />
      <path d="M12 26C16 16 26 14 30 14C24 22 18 28 12 26Z" fill="#582C83" />
    </svg>
  )
};

export const AIRLINES = [
  { id: 'AI', name: 'Air India', code: 'AI' },
  { id: '6E', name: 'IndiGo', code: '6E' },
  { id: 'UK', name: 'Vistara', code: 'UK' },
  { id: 'SG', name: 'SpiceJet', code: 'SG' },
  { id: 'QP', name: 'Akasa Air', code: 'QP' }
];

export const PROMO_CODES = [
  { code: 'YATRA15', discountPercent: 15, maxDiscount: 1500, description: 'Flat 15% Instant Discount with HDFC & ICICI Cards' },
  { code: 'WELCOME500', discountAmount: 500, description: '₹500 OFF on your first flight booking' },
  { code: 'FESTIVE1000', discountAmount: 1000, description: 'Special Festive Offer for Round Trips' }
];
