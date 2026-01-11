import { describe, expect, test } from 'bun:test'
import { linuxUsernameSchema, tcpPortSchema } from '../lib/zod'

describe('usernameSchema', () => {
  test('should accept valid Linux username starting with letter', () => {
    const result = linuxUsernameSchema.parse('delphis')
    expect(result).toBe('delphis')
  })

  test('should accept valid Linux username starting with underscore', () => {
    const result = linuxUsernameSchema.parse('_user')
    expect(result).toBe('_user')
  })

  test('should accept username with numbers', () => {
    const result = linuxUsernameSchema.parse('user123')
    expect(result).toBe('user123')
  })

  test('should accept username with hyphens', () => {
    const result = linuxUsernameSchema.parse('user-name')
    expect(result).toBe('user-name')
  })

  test('should accept username with underscores', () => {
    const result = linuxUsernameSchema.parse('user_name')
    expect(result).toBe('user_name')
  })

  test('should accept username with mixed valid characters', () => {
    const result = linuxUsernameSchema.parse('user-name_123')
    expect(result).toBe('user-name_123')
  })

  test('should accept maximum length username (32 chars)', () => {
    const longUsername = 'a'.repeat(32)
    const result = linuxUsernameSchema.parse(longUsername)
    expect(result).toBe(longUsername)
  })

  test('should accept single character username', () => {
    const result = linuxUsernameSchema.parse('a')
    expect(result).toBe('a')
  })

  test('should transform empty string to null', () => {
    const result = linuxUsernameSchema.parse('')
    expect(result).toBeNull()
  })

  test('should accept undefined (optional)', () => {
    const result = linuxUsernameSchema.parse(undefined)
    expect(result).toBeUndefined()
  })

  test('should accept when not provided (optional)', () => {
    const result = linuxUsernameSchema.safeParse(undefined)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBeUndefined()
    }
  })

  test('should reject username starting with digit', () => {
    expect(() => linuxUsernameSchema.parse('123user')).toThrow()
    expect(() => linuxUsernameSchema.parse('0user')).toThrow()
  })

  test('should reject username starting with hyphen', () => {
    expect(() => linuxUsernameSchema.parse('-user')).toThrow()
  })

  test('should reject username with spaces', () => {
    expect(() => linuxUsernameSchema.parse('user name')).toThrow()
    expect(() => linuxUsernameSchema.parse(' user')).toThrow()
    expect(() => linuxUsernameSchema.parse('user ')).toThrow()
  })

  test('should reject username with invalid special characters', () => {
    expect(() => linuxUsernameSchema.parse('user@name')).toThrow()
    expect(() => linuxUsernameSchema.parse('user#name')).toThrow()
    expect(() => linuxUsernameSchema.parse('user$name')).toThrow()
    expect(() => linuxUsernameSchema.parse('user.name')).toThrow()
    expect(() => linuxUsernameSchema.parse('user+name')).toThrow()
  })

  test('should reject username exceeding 32 characters', () => {
    const tooLong = 'a'.repeat(33)
    expect(() => linuxUsernameSchema.parse(tooLong)).toThrow()
  })

  test('should reject whitespace-only strings', () => {
    expect(() => linuxUsernameSchema.parse('   ')).toThrow()
    expect(() => linuxUsernameSchema.parse('\t')).toThrow()
    expect(() => linuxUsernameSchema.parse('\n')).toThrow()
  })

  test('should reject non-string values', () => {
    expect(() => linuxUsernameSchema.parse(123)).toThrow()
    expect(() => linuxUsernameSchema.parse(true)).toThrow()
    expect(() => linuxUsernameSchema.parse({})).toThrow()
    expect(() => linuxUsernameSchema.parse([])).toThrow()
  })

  test('should accept all lowercase username', () => {
    const result = linuxUsernameSchema.parse('username')
    expect(result).toBe('username')
  })

  test('should accept all uppercase username', () => {
    const result = linuxUsernameSchema.parse('USERNAME')
    expect(result).toBe('USERNAME')
  })

  test('should accept mixed case username', () => {
    const result = linuxUsernameSchema.parse('UserName')
    expect(result).toBe('UserName')
  })
})

describe('portSchema', () => {
  test('should accept valid integer port numbers', () => {
    expect(tcpPortSchema.parse(22)).toBe(22)
    expect(tcpPortSchema.parse(80)).toBe(80)
    expect(tcpPortSchema.parse(443)).toBe(443)
    expect(tcpPortSchema.parse(22444)).toBe(22444)
    expect(tcpPortSchema.parse(65535)).toBe(65535)
    expect(tcpPortSchema.parse(1)).toBe(1)
  })

  test('should coerce string numbers to integers', () => {
    expect(tcpPortSchema.parse('22')).toBe(22)
    expect(tcpPortSchema.parse('80')).toBe(80)
    expect(tcpPortSchema.parse('443')).toBe(443)
    expect(tcpPortSchema.parse('22444')).toBe(22444)
    expect(tcpPortSchema.parse('65535')).toBe(65535)
    expect(tcpPortSchema.parse('1')).toBe(1)
  })

  test('should reject ports below minimum (0)', () => {
    expect(() => tcpPortSchema.parse(0)).toThrow('Port must be greater than 0')
    expect(() => tcpPortSchema.parse('0')).toThrow('Port must be greater than 0')
  })

  test('should reject negative ports', () => {
    expect(() => tcpPortSchema.parse(-1)).toThrow('Port must be greater than 0')
    expect(() => tcpPortSchema.parse('-1')).toThrow('Port must be greater than 0')
    expect(() => tcpPortSchema.parse(-100)).toThrow('Port must be greater than 0')
  })

  test('should reject ports above maximum (65535)', () => {
    expect(() => tcpPortSchema.parse(65536)).toThrow(
      'Port must be between 1 and 65535',
    )
    expect(() => tcpPortSchema.parse('65536')).toThrow(
      'Port must be between 1 and 65535',
    )
    expect(() => tcpPortSchema.parse(99999)).toThrow(
      'Port must be between 1 and 65535',
    )
  })

  test('should reject non-integer numbers', () => {
    expect(() => tcpPortSchema.parse(22.5)).toThrow('Port must be an integer')
    expect(() => tcpPortSchema.parse('22.5')).toThrow('Port must be an integer')
    expect(() => tcpPortSchema.parse(80.1)).toThrow('Port must be an integer')
    expect(() => tcpPortSchema.parse(3.14)).toThrow('Port must be an integer')
  })

  test('should reject non-numeric strings', () => {
    expect(() => tcpPortSchema.parse('abc')).toThrow()
    expect(() => tcpPortSchema.parse('not-a-number')).toThrow()
    expect(() => tcpPortSchema.parse('port22')).toThrow()
  })

  test('should reject invalid types', () => {
    expect(() => tcpPortSchema.parse(null)).toThrow()
    expect(() => tcpPortSchema.parse(undefined)).toThrow()
    expect(() => tcpPortSchema.parse(true)).toThrow()
    expect(() => tcpPortSchema.parse(false)).toThrow()
    expect(() => tcpPortSchema.parse({})).toThrow()
    expect(() => tcpPortSchema.parse([])).toThrow()
  })

  test('should handle edge cases at boundaries', () => {
    // Minimum valid port
    expect(tcpPortSchema.parse(1)).toBe(1)
    expect(tcpPortSchema.parse('1')).toBe(1)

    // Maximum valid port
    expect(tcpPortSchema.parse(65535)).toBe(65535)
    expect(tcpPortSchema.parse('65535')).toBe(65535)
  })

  test('should coerce and validate in one step', () => {
    const result = tcpPortSchema.parse('8080')
    expect(result).toBe(8080)
    expect(typeof result).toBe('number')
  })

  test('should handle scientific notation strings', () => {
    expect(() => tcpPortSchema.parse('1e5')).toThrow('Port must be an integer')
  })
})
