// Common medicines database
const medicineDatabase = {
  "8901234567890": {
    name: "Panadol 500mg",
    category: "Tablet",
    description: "Paracetamol, pain/fever relief",
    threshold: 50
  },
  "8901234567883": {
    name: "Salbutamol Syrup",
    category: "Syrup",
    description: "Asthma relief syrup",
    threshold: 20
  },
  "8901234567876": {
    name: "Amoxil 250mg",
    category: "Capsule",
    description: "Amoxicillin antibiotic",
    threshold: 30
  },
  "8901234567869": {
    name: "Metformin 500mg",
    category: "Tablet",
    description: "Diabetes control",
    threshold: 40
  },
  "8901234567852": {
    name: "Loratadine 10mg",
    category: "Tablet",
    description: "Allergy relief",
    threshold: 25
  },
  "8901234567845": {
    name: "Vitamin C 100mg",
    category: "Tablet",
    description: "Immune support",
    threshold: 35
  },
  "8901234567838": {
    name: "Cefuroxime 250mg",
    category: "Tablet",
    description: "Antibiotic",
    threshold: 20
  },
  "8901234567821": {
    name: "Domperidone 10mg",
    category: "Tablet",
    description: "Nausea/vomiting relief",
    threshold: 15
  },
  "8901234567814": {
    name: "Ibuprofen 200mg",
    category: "Tablet",
    description: "Pain/inflammation relief",
    threshold: 30
  },
  "8901234567807": {
    name: "ORS Sachet",
    category: "Powder",
    description: "Oral rehydration salts",
    threshold: 10
  }
};

export const getMedicineByBarcode = (barcode) => {
  return medicineDatabase[barcode] || null;
};

export const addMedicineToDatabase = (barcode, medicineData) => {
  medicineDatabase[barcode] = medicineData;
};

export default medicineDatabase; 