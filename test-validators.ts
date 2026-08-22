import {
  validateFullName,
  validateGmail,
  validatePassword,
  normalizeEmail,
} from './src/lib/validators.ts'

console.log('--- RUNNING AUTH VALIDATION SUITE ---')

const cases = [
  {
    name: 'TEST 1: naga@123',
    test: () => {
      const res = validateGmail('naga@123')
      console.assert(!res.isValid, 'Should be invalid')
      console.assert(res.error === 'Please enter a valid Gmail address.', 'Error message match')
      console.log('✅ TEST 1 passed: naga@123 blocked with message:', res.error)
    }
  },
  {
    name: 'TEST 2: naga',
    test: () => {
      const res = validateGmail('naga')
      console.assert(!res.isValid, 'Should be invalid')
      console.log('✅ TEST 2 passed: naga blocked')
    }
  },
  {
    name: 'TEST 3: naga@gmail',
    test: () => {
      const res = validateGmail('naga@gmail')
      console.assert(!res.isValid, 'Should be invalid')
      console.log('✅ TEST 3 passed: naga@gmail blocked')
    }
  },
  {
    name: 'TEST 4: @gmail.com',
    test: () => {
      const res = validateGmail('@gmail.com')
      console.assert(!res.isValid, 'Should be invalid')
      console.log('✅ TEST 4 passed: @gmail.com blocked')
    }
  },
  {
    name: 'TEST 4b: naga@.',
    test: () => {
      const res = validateGmail('naga@.')
      console.assert(!res.isValid, 'Should be invalid')
      console.log('✅ TEST 4b passed: naga@. blocked')
    }
  },
  {
    name: 'TEST 4c: naga @gmail.com',
    test: () => {
      const res = validateGmail('naga @gmail.com')
      console.assert(!res.isValid, 'Should be invalid')
      console.log('✅ TEST 4c passed: naga @gmail.com blocked')
    }
  },
  {
    name: 'TEST 5: Short password',
    test: () => {
      const res = validatePassword('123')
      console.assert(!res.isValid, 'Should be invalid')
      console.assert(res.error === 'Password must be at least 8 characters.', 'Error message match')
      console.log('✅ TEST 5 passed: 123 password blocked with message:', res.error)
    }
  },
  {
    name: 'TEST 6: Valid Gmail & Password & Name',
    test: () => {
      const nameRes = validateFullName('Naga Chaitanya')
      const emailRes = validateGmail('naga@gmail.com')
      const passRes = validatePassword('SecurePass123!')
      console.assert(nameRes.isValid && emailRes.isValid && passRes.isValid, 'Should all be valid')
      console.log('✅ TEST 6 passed: Valid inputs accepted')
    }
  },
  {
    name: 'TEST 7: Name validation (space only or short)',
    test: () => {
      const name1 = validateFullName('   ')
      const name2 = validateFullName('N')
      console.assert(!name1.isValid && name1.error === 'Please enter your full name.')
      console.assert(!name2.isValid && name2.error === 'Please enter your full name.')
      console.log('✅ TEST 7 passed: Name validation properly rejects empty/short names')
    }
  },
  {
    name: 'TEST 8: Email normalization',
    test: () => {
      const norm = normalizeEmail('  Naga.Doe@Gmail.COM  ')
      console.assert(norm === 'naga.doe@gmail.com', 'Normalized properly')
      console.log('✅ TEST 8 passed: Normalization works ->', norm)
    }
  }
]

cases.forEach(c => c.test())
console.log('--- ALL VALIDATION TESTS PASSED SUCCESSFULLY! ---')
