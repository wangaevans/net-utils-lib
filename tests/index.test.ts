import NetUtilsLib from '../src';

describe('NetUtilsLib', () => {
    let networkLib: NetUtilsLib;

    beforeEach(() => {
        networkLib = new NetUtilsLib();
    });

    test('valid IPv4 addresses', () => {
        expect(networkLib.isValidIPv4('192.168.1.1')).toBe(true);
        expect(networkLib.isValidIPv4('256.256.256.256')).toBe(false);
    });

    test('valid CIDR notation', () => {
        expect(networkLib.isValidCIDR(24)).toBe(true);
        expect(networkLib.isValidCIDR(33)).toBe(false);
    });

    test('IP class determination', () => {
        expect(networkLib.getIPClass('10.0.0.1')).toBe('A');
        expect(networkLib.getIPClass('172.16.0.1')).toBe('B');
        expect(networkLib.getIPClass('192.168.1.1')).toBe('C');
        expect(networkLib.getIPClass('224.0.0.1')).toBe('D');
        expect(networkLib.getIPClass('240.0.0.1')).toBe('E');
    });

    test('binary conversion', () => {
        expect(networkLib.ipToBinary('192.168.1.1')).toBe('11000000101010000000000100000001');
        expect(networkLib.binaryToIP('11000000101010000000000100000001')).toBe('192.168.1.1');
    });

    test('subnet mask calculation', () => {
        expect(networkLib.calculateSubnetMask(24)).toBe('255.255.255.0');
    });

    test('CIDR calculation from subnet mask', () => {
        expect(networkLib.calculateCIDR('255.255.255.0')).toBe(24);
    });
    test('Wildcard Mask calculation from subnet mask or CIDR', () => {
        expect(networkLib.calculateWildCardMask('255.255.255.0')).toBe('0.0.0.255');
    });

    test('network address calculation', () => {
        expect(networkLib.calculateNetworkAddress('192.168.1.10', '255.255.255.0')).toBe('192.168.1.0');
    });

    test('broadcast address calculation', () => {
        expect(networkLib.calculateBroadcastAddress('192.168.1.10', '255.255.255.0')).toBe('192.168.1.255');
    });

    test('IP range calculation', () => {
        const range = networkLib.calculateIPRange('192.168.1.0', '255.255.255.0');
        expect(range.firstIP).toBe('192.168.1.1');
        expect(range.lastIP).toBe('192.168.1.254');
    });

    test('subnet allocation', () => {
        const subnets = networkLib.allocateSubnets('192.168.1.0', '255.255.255.0', [24, 26]);
        expect(subnets).toHaveLength(2);
        expect(subnets[0].firstIP).toBe('192.168.1.1');
        expect(subnets[1].firstIP).toBe('192.168.1.33');
    });
});
