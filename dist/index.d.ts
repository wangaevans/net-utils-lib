declare const allocateSubnets: (ip: string, subnetMaskOrCIDR: string, hostsPerSubnet: number[]) => {
    network: string;
    subnetMask: string;
    cidr: number;
    broadcast: string;
    firstIP: string;
    lastIP: string;
    wildCardMask: string;
    availableIPs: number;
}[], binaryToIP: (binary: string) => string, calculateAvailableIPs: (subnetMaskOrCIDR: string) => number, calculateBroadcastAddress: (ip: string, subnetMaskOrCIDR: string) => string, calculateCIDR: (subnetMask: string) => number, calculateIPRange: (networkAddress: string, subnetMaskOrCIDR: string) => {
    firstIP: string;
    lastIP: string;
}, calculateNetworkAddress: (ip: string, subnetMaskOrCIDR: string) => string, calculateRequiredSubnets: (hostCounts: number[]) => number[], calculateSubnetMask: (cidr: number) => string, calculateWildCardMask: (subnetMaskOrCIDR: string) => string, decrementIP: (ip: string) => string, getIPClass: (ip: string) => string, incrementIP: (ip: string) => string, ipToBinary: (ip: string) => string, isValidCIDR: (cidr: number) => boolean, isValidIPv4: (ip: string) => boolean, normalizeMaskToCIDR: (subnetMaskOrCIDR: string) => number;
export { allocateSubnets, binaryToIP, calculateAvailableIPs, calculateBroadcastAddress, calculateCIDR, calculateIPRange, calculateNetworkAddress, calculateRequiredSubnets, calculateSubnetMask, calculateWildCardMask, decrementIP, getIPClass, incrementIP, ipToBinary, isValidCIDR, isValidIPv4, normalizeMaskToCIDR };
//# sourceMappingURL=index.d.ts.map