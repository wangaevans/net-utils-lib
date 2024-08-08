import { allocateSubnets, binaryToIP, calculateBroadcastAddress, calculateCIDR, calculateIPRange, calculateNetworkAddress, calculateSubnetMask, calculateWildCardMask, getIPClass, ipToBinary, isValidCIDR, isValidIPv4 } from '../src';

describe('Network Utils Library', () => {

    test('valid IPv4 addresses', () => {
        expect(isValidIPv4('192.168.1.1')).toBe(true);
        expect(isValidIPv4('256.256.256.256')).toBe(false);
    });

    test('valid CIDR notation', () => {
        expect(isValidCIDR(24)).toBe(true);
        expect(isValidCIDR(33)).toBe(false);
    });

    test('IP class determination', () => {
        expect(getIPClass('10.0.0.1')).toBe('A');
        expect(getIPClass('172.16.0.1')).toBe('B');
        expect(getIPClass('192.168.1.1')).toBe('C');
        expect(getIPClass('224.0.0.1')).toBe('D');
        expect(getIPClass('240.0.0.1')).toBe('E');
    });

    test('binary conversion', () => {
        expect(ipToBinary('192.168.1.1')).toBe('11000000101010000000000100000001');
        expect(binaryToIP('11000000101010000000000100000001')).toBe('192.168.1.1');
    });

    test('subnet mask calculation', () => {
        expect(calculateSubnetMask(24)).toBe('255.255.255.0');
    });

    test('CIDR calculation from subnet mask', () => {
        expect(calculateCIDR('255.255.255.0')).toBe(24);
    });
    test('Wildcard Mask calculation from subnet mask or CIDR', () => {
        expect(calculateWildCardMask('255.255.255.0')).toBe('0.0.0.255');
    });

    test('network address calculation', () => {
        expect(calculateNetworkAddress('192.168.1.10', '255.255.255.0')).toBe('192.168.1.0');
    });

    test('broadcast address calculation', () => {
        expect(calculateBroadcastAddress('192.168.1.10', '255.255.255.0')).toBe('192.168.1.255');
    });

    test('IP range calculation', () => {
        const range = calculateIPRange('192.168.1.0', '255.255.255.0');
        expect(range.firstIP).toBe('192.168.1.1');
        expect(range.lastIP).toBe('192.168.1.254');
    });

    test('subnet allocation', () => {
        const subnets = allocateSubnets('192.168.1.0', '255.255.255.0', [24, 26]);
        expect(subnets).toHaveLength(2);
        expect(subnets[0].firstIP).toBe('192.168.1.1');
        expect(subnets[1].firstIP).toBe('192.168.1.33');
    });
});
