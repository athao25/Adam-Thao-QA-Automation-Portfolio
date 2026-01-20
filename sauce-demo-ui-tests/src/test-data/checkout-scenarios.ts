export interface CheckoutScenario {
  name: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  shouldSucceed: boolean;
  expectedError?: string;
}

export const CHECKOUT_VALIDATION_SCENARIOS: CheckoutScenario[] = [
  {
    name: 'Valid shipping info',
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '12345',
    shouldSucceed: true,
  },
  {
    name: 'Missing first name',
    firstName: '',
    lastName: 'Doe',
    postalCode: '12345',
    shouldSucceed: false,
    expectedError: 'First Name is required',
  },
  {
    name: 'Missing last name',
    firstName: 'John',
    lastName: '',
    postalCode: '12345',
    shouldSucceed: false,
    expectedError: 'Last Name is required',
  },
  {
    name: 'Missing postal code',
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '',
    shouldSucceed: false,
    expectedError: 'Postal Code is required',
  },
  {
    name: 'All fields empty',
    firstName: '',
    lastName: '',
    postalCode: '',
    shouldSucceed: false,
    expectedError: 'First Name is required',
  },
  {
    name: 'Special characters in name',
    firstName: "Mary-Jane",
    lastName: "O'Connor",
    postalCode: '90210',
    shouldSucceed: true,
  },
  {
    name: 'International postal code',
    firstName: 'Hans',
    lastName: 'Mueller',
    postalCode: 'DE-80331',
    shouldSucceed: true,
  },
  {
    name: 'Numeric first name',
    firstName: '12345',
    lastName: 'Test',
    postalCode: '55555',
    shouldSucceed: true,
  },
];

export interface CartScenario {
  name: string;
  products: string[];
  expectedItemCount: number;
}

export const CART_SCENARIOS: CartScenario[] = [
  {
    name: 'Single item',
    products: ['Sauce Labs Backpack'],
    expectedItemCount: 1,
  },
  {
    name: 'Two items',
    products: ['Sauce Labs Backpack', 'Sauce Labs Bike Light'],
    expectedItemCount: 2,
  },
  {
    name: 'Three items',
    products: [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
    ],
    expectedItemCount: 3,
  },
  {
    name: 'All items',
    products: [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ],
    expectedItemCount: 6,
  },
];
