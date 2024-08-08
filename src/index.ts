// Interface representing an IP range with a start and end value, and a default subnet mask
interface IPRange {
    start: number;
    end: number;
    defaultMask: string | null;
}

// Interface representing IP class ranges for A, B, C, D, and E classes
interface IPClassRanges {
    A: IPRange;
    B: IPRange;
    C: IPRange;
    D: IPRange;
    E: IPRange;
}

// Class providing various network utility functions
class NetUtilsLib {
    private classRanges: IPClassRanges;

    constructor() {
        // Define IP ranges and default subnet masks for each IP class
        this.classRanges = {
            A: { start: 1, end: 126, defaultMask: '255.0.0.0' },
            B: { start: 128, end: 191, defaultMask: '255.255.0.0' },
            C: { start: 192, end: 223, defaultMask: '255.255.255.0' },
            D: { start: 224, end: 239, defaultMask: null },
            E: { start: 240, end: 255, defaultMask: null }
        };
    }

    /**
     * Validate if a given IP address is a valid IPv4 address.
     * @param ip - The IP address to validate.
     * @returns True if the IP address is valid, otherwise false.
     */
    isValidIPv4(ip: string): boolean {
        const pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!pattern.test(ip)) return false;
        return ip.split('.').every(octet => parseInt(octet) >= 0 && parseInt(octet) <= 255);
    }

    /**
     * Validate if a given CIDR notation is valid (0 to 32).
     * @param cidr - The CIDR notation to validate.
     * @returns True if the CIDR notation is valid, otherwise false.
     */
    isValidCIDR(cidr: number): boolean {
        return Number.isInteger(cidr) && cidr >= 0 && cidr <= 32;
    }

    /**
     * Determine the IP class (A, B, C, D, E) for a given IP address.
     * @param ip - The IP address to classify.
     * @returns The IP class name as a string, or 'Unknown' if it doesn't fit any class.
     */
    getIPClass(ip: string): string {
        if (!this.isValidIPv4(ip)) throw new Error('Invalid IP address');
        const firstOctet = parseInt(ip.split('.')[0]);
        for (const [className, range] of Object.entries(this.classRanges)) {
            if (firstOctet >= range.start && firstOctet <= range.end) return className;
        }
        return 'Unknown';
    }

    /**
     * Convert an IPv4 address to its binary representation.
     * @param ip - The IP address to convert.
     * @returns The binary representation of the IP address.
     */
    ipToBinary(ip: string): string {
        if (!this.isValidIPv4(ip)) throw new Error('Invalid IP address');
        return ip.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join('');
    }

    /**
     * Convert a binary string to its IPv4 address representation.
     * @param binary - The binary string to convert.
     * @returns The IPv4 address representation of the binary string.
     */
    binaryToIP(binary: string): string {
        if (binary.length !== 32 || !/^[01]+$/.test(binary)) throw new Error('Invalid binary string');
        return binary.match(/.{8}/g)!.map(octet => parseInt(octet, 2)).join('.');
    }

    /**
     * Calculate the subnet mask from a given CIDR notation.
     * @param cidr - The CIDR notation to convert.
     * @returns The subnet mask in IPv4 address format.
     */
    calculateSubnetMask(cidr: number): string {
        if (!this.isValidCIDR(cidr)) throw new Error('Invalid CIDR notation');
        const mask = '1'.repeat(cidr).padEnd(32, '0');
        return this.binaryToIP(mask);
    }

    /**
     * Calculate the CIDR notation from a given subnet mask.
     * @param subnetMask - The subnet mask to convert.
     * @returns The CIDR notation corresponding to the subnet mask.
     */
    calculateCIDR(subnetMask: string): number {
        if (!this.isValidIPv4(subnetMask)) throw new Error('Invalid subnet mask');
        return this.ipToBinary(subnetMask).split('0')[0].length;
    }

    /**
     * Normalize a given subnet mask or CIDR notation to CIDR notation.
     * @param subnetMaskOrCIDR - The subnet mask or CIDR notation to normalize.
     * @returns The CIDR notation.
     * @throws Error if the input is invalid.
     */
    normalizeMaskToCIDR(subnetMaskOrCIDR: string): number {
        if (this.isValidCIDR(parseInt(subnetMaskOrCIDR))) {
            return parseInt(subnetMaskOrCIDR);
        } else if (this.isValidIPv4(subnetMaskOrCIDR)) {
            return this.calculateCIDR(subnetMaskOrCIDR);
        } else {
            throw new Error('Invalid subnet mask or CIDR notation');
        }
    }

    /**
     * Calculate the network address for a given IP and subnet mask or CIDR notation.
     * @param ip - The IP address to use.
     * @param subnetMaskOrCIDR - The subnet mask or CIDR notation.
     * @returns The network address.
     */
    calculateNetworkAddress(ip: string, subnetMaskOrCIDR: string): string {
        if (!this.isValidIPv4(ip)) throw new Error('Invalid IP address');
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const ipBinary = this.ipToBinary(ip);
        const maskBinary = this.ipToBinary(subnetMask);
        const networkBinary = ipBinary.split('').map((bit, index) => Number(bit) & Number(maskBinary[index])).join('');
        return this.binaryToIP(networkBinary);
    }

    /**
     * Calculate the broadcast address for a given IP and subnet mask or CIDR notation.
     * @param ip - The IP address to use.
     * @param subnetMaskOrCIDR - The subnet mask or CIDR notation.
     * @returns The broadcast address.
     */
    calculateBroadcastAddress(ip: string, subnetMaskOrCIDR: string): string {
        if (!this.isValidIPv4(ip)) throw new Error('Invalid IP address');
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const ipBinary = this.ipToBinary(ip);
        const maskBinary = this.ipToBinary(subnetMask);
        const invertedMask = maskBinary.split('').map(bit => bit === '0' ? '1' : '0').join('');
        const broadcastBinary = ipBinary.split('').map((bit, index) => Number(bit) | Number(invertedMask[index])).join('');
        return this.binaryToIP(broadcastBinary);
    }

    /**
     * Calculate the IP range (first and last usable IP) for a given network address and subnet mask or CIDR notation.
     * @param networkAddress - The network address.
     * @param subnetMaskOrCIDR - The subnet mask or CIDR notation.
     * @returns An object with the first and last usable IP addresses.
     */
    calculateIPRange(networkAddress: string, subnetMaskOrCIDR: string) {
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const firstIP = this.incrementIP(networkAddress);
        const broadcast = this.calculateBroadcastAddress(networkAddress, subnetMask);
        const lastIP = this.decrementIP(broadcast);
        return { firstIP, lastIP };
    }

    /**
     * Increment an IP address by one.
     * @param ip - The IP address to increment.
     * @returns The incremented IP address.
     */
    incrementIP(ip: string): string {
        const binary = BigInt(`0b${this.ipToBinary(ip)}`) + BigInt(1);
        return this.binaryToIP(binary.toString(2).padStart(32, '0'));
    }

    /**
     * Decrement an IP address by one.
     * @param ip - The IP address to decrement.
     * @returns The decremented IP address.
     */
    decrementIP(ip: string): string {
        const binary = BigInt(`0b${this.ipToBinary(ip)}`) - BigInt(1);
        return this.binaryToIP(binary.toString(2).padStart(32, '0'));
    }

    /**
     * Calculate the number of available IP addresses for a given subnet mask or CIDR notation.
     * @param subnetMaskOrCIDR - The subnet mask or CIDR notation.
     * @returns The number of available IP addresses.
     */
    calculateAvailableIPs(subnetMaskOrCIDR: string): number {
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        return Math.pow(2, 32 - cidr) - 2; // Subtract 2 for network and broadcast addresses
    }
    /**
     * Calculate the wildcard mask for a given subnet mask or CIDR notation.
     * @param subnetMaskOrCIDR - The subnet mask or CIDR notation.
     * @returns The wildcard mask in IPv4 address format.
     */
    calculateWildCardMask(subnetMaskOrCIDR: string): string {
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const maskBinary = this.ipToBinary(subnetMask);
        const invertedMask = maskBinary.split('').map(bit => bit === '0' ? '1' : '0').join('');
        return this.binaryToIP(invertedMask);
    }

    /**
     * Calculate the required subnet sizes (in CIDR notation) for a list of host counts.
     * @param hostCounts - An array of host counts for which subnets are required.
     * @returns An array of required subnet sizes in CIDR notation, sorted in descending order.
     */
    calculateRequiredSubnets(hostCounts: number[]): number[] {
        hostCounts.sort((a, b) => b - a);

        return hostCounts.map(count => {
            const requiredBits = Math.ceil(Math.log2(count + 2));
            return 32 - requiredBits;
        }).sort((a, b) => b - a);
    }

    /**
     * Allocate subnets from a given network address and subnet mask or CIDR notation.
     * @param ip - The starting IP address of the network.
     * @param subnetMaskOrCIDR - The subnet mask or CIDR notation for the network.
     * @param hostsPerSubnet - An array of required host counts for each subnet.
     * @returns An array of subnet details, each including network address, subnet mask, CIDR notation, broadcast address, first and last IP addresses, wildcard mask, and the number of available IP addresses.
     */
    allocateSubnets(ip: string, subnetMaskOrCIDR: string, hostsPerSubnet: number[]) {
        const networkAddress = this.calculateNetworkAddress(ip, subnetMaskOrCIDR);
        let currentNetwork = this.ipToBinary(networkAddress);
        const subnetSizes = this.calculateRequiredSubnets(hostsPerSubnet);
        subnetSizes.sort((a, b) => a - b);

        return subnetSizes.map(size => {
            const subnetMask = this.calculateSubnetMask(size);
            const network = this.binaryToIP(currentNetwork);
            const broadcast = this.calculateBroadcastAddress(network, subnetMask);
            const { firstIP, lastIP } = this.calculateIPRange(network, subnetMask);
            const nextNetwork = this.ipToBinary(this.incrementIP(broadcast));
            currentNetwork = nextNetwork;
            return {
                network,
                subnetMask,
                cidr: size,
                broadcast,
                firstIP,
                lastIP,
                wildCardMask: this.calculateWildCardMask(subnetMask),
                availableIPs: this.calculateAvailableIPs(size.toString())
            };
        });
    }
}

const netLib = new NetUtilsLib()
const { allocateSubnets, binaryToIP, calculateAvailableIPs, calculateBroadcastAddress, calculateCIDR, calculateIPRange, calculateNetworkAddress, calculateRequiredSubnets, calculateSubnetMask, calculateWildCardMask, decrementIP, getIPClass, incrementIP, ipToBinary, isValidCIDR, isValidIPv4, normalizeMaskToCIDR } = netLib

export {
    allocateSubnets,
    binaryToIP,
    calculateAvailableIPs,
    calculateBroadcastAddress,
    calculateCIDR,
    calculateIPRange,
    calculateNetworkAddress,
    calculateRequiredSubnets,
    calculateSubnetMask,
    calculateWildCardMask,
    decrementIP,
    getIPClass,
    incrementIP,
    ipToBinary,
    isValidCIDR,
    isValidIPv4,
    normalizeMaskToCIDR
};
