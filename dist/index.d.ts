declare class NetUtilsLib {
    private classRanges;
    constructor();
    isValidIPv4(ip: string): boolean;
    isValidCIDR(cidr: number): boolean;
    getIPClass(ip: string): string;
    ipToBinary(ip: string): string;
    binaryToIP(binary: string): string;
    calculateSubnetMask(cidr: number): string;
    calculateCIDR(subnetMask: string): number;
    normalizeMaskToCIDR(subnetMaskOrCIDR: string): number;
    calculateNetworkAddress(ip: string, subnetMaskOrCIDR: string): string;
    calculateBroadcastAddress(ip: string, subnetMaskOrCIDR: string): string;
    calculateIPRange(networkAddress: string, subnetMaskOrCIDR: string): {
        firstIP: string;
        lastIP: string;
    };
    incrementIP(ip: string): string;
    decrementIP(ip: string): string;
    calculateAvailableIPs(subnetMaskOrCIDR: string): number;
    calculateWildCardMask(subnetMaskOrCIDR: string): string;
    calculateRequiredSubnets(hostCounts: number[]): number[];
    allocateSubnets(ip: string, subnetMaskOrCIDR: string, hostsPerSubnet: number[]): {
        network: string;
        subnetMask: string;
        cidr: number;
        broadcast: string;
        firstIP: string;
        lastIP: string;
        wildCardMask: string;
        availableIPs: number;
    }[];
}
export default NetUtilsLib;
//# sourceMappingURL=index.d.ts.map