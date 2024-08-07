interface IPRange {
    start: number;
    end: number;
    defaultMask: string | null;
}

interface IPClassRanges {
    A: IPRange;
    B: IPRange;
    C: IPRange;
    D: IPRange;
    E: IPRange;
}

class NetUtilsLib {
    private classRanges: IPClassRanges;

    constructor() {
        this.classRanges = {
            A: { start: 1, end: 126, defaultMask: '255.0.0.0' },
            B: { start: 128, end: 191, defaultMask: '255.255.0.0' },
            C: { start: 192, end: 223, defaultMask: '255.255.255.0' },
            D: { start: 224, end: 239, defaultMask: null },
            E: { start: 240, end: 255, defaultMask: null }
        };
    }


    isValidIPv4(ip: string) {
        const pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!pattern.test(ip)) return false;
        return ip.split('.').every(octet => parseInt(octet) >= 0 && parseInt(octet) <= 255);
    }

    isValidCIDR(cidr: number) {
        return Number.isInteger(cidr) && cidr >= 0 && cidr <= 32;
    }

    getIPClass(ip: string) {
        if (!this.isValidIPv4(ip)) throw new Error('Invalid IP address');
        const firstOctet = parseInt(ip.split('.')[0]);
        for (const [className, range] of Object.entries(this.classRanges)) {
            if (firstOctet >= range.start && firstOctet <= range.end) return className;
        }
        return 'Unknown';
    }

    ipToBinary(ip: string) {
        if (!this.isValidIPv4(ip)) throw new Error('Invalid IP address');
        return ip.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join('');
    }

    binaryToIP(binary: string) {
        if (binary.length !== 32 || !/^[01]+$/.test(binary)) throw new Error('Invalid binary string');
        return binary.match(/.{8}/g)!.map(octet => parseInt(octet, 2)).join('.');
    }

    calculateSubnetMask(cidr: number) {
        if (!this.isValidCIDR(cidr)) throw new Error('Invalid CIDR notation');
        const mask = '1'.repeat(cidr).padEnd(32, '0');
        return this.binaryToIP(mask);
    }

    calculateCIDR(subnetMask: string) {
        if (!this.isValidIPv4(subnetMask)) throw new Error('Invalid subnet mask');
        return this.ipToBinary(subnetMask).split('0')[0].length;
    }

    normalizeMaskToCIDR(subnetMaskOrCIDR: string) {
        if (this.isValidCIDR(parseInt(subnetMaskOrCIDR))) {
            return parseInt(subnetMaskOrCIDR);
        } else if (this.isValidIPv4(subnetMaskOrCIDR)) {
            return this.calculateCIDR(subnetMaskOrCIDR);
        } else {
            throw new Error('Invalid subnet mask or CIDR notation');
        }
    }

    calculateNetworkAddress(ip: string, subnetMaskOrCIDR: string) {
        if (!this.isValidIPv4(ip)) throw new Error('Invalid IP address');
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const ipBinary = this.ipToBinary(ip);
        const maskBinary = this.ipToBinary(subnetMask);
        const networkBinary = ipBinary.split('').map((bit, index) => Number(bit) & Number(maskBinary[index])).join('');
        return this.binaryToIP(networkBinary);
    }

    calculateBroadcastAddress(ip: string, subnetMaskOrCIDR: string) {
        if (!this.isValidIPv4(ip)) throw new Error('Invalid IP address');
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const ipBinary = this.ipToBinary(ip);
        const maskBinary = this.ipToBinary(subnetMask);
        const invertedMask = maskBinary.split('').map(bit => bit === '0' ? '1' : '0').join('');
        const broadcastBinary = ipBinary.split('').map((bit, index) => Number(bit) | Number(invertedMask[index])).join('');
        return this.binaryToIP(broadcastBinary);
    }

    calculateIPRange(networkAddress: string, subnetMaskOrCIDR: string) {
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const firstIP = this.incrementIP(networkAddress);
        const broadcast = this.calculateBroadcastAddress(networkAddress, subnetMask);
        const lastIP = this.decrementIP(broadcast);
        return { firstIP, lastIP };
    }

    incrementIP(ip: string) {
        const binary = BigInt(`0b${this.ipToBinary(ip)}`) + BigInt(1);
        return this.binaryToIP(binary.toString(2).padStart(32, '0'));
    }

    decrementIP(ip: string) {
        const binary = BigInt(`0b${this.ipToBinary(ip)}`) - BigInt(1);
        return this.binaryToIP(binary.toString(2).padStart(32, '0'));
    }

    calculateAvailableIPs(subnetMaskOrCIDR: string) {
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        return Math.pow(2, 32 - cidr) - 2;
    }

    calculateWildCardMask(subnetMaskOrCIDR: string) {
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const maskBinary = this.ipToBinary(subnetMask);
        const invertedMask = maskBinary.split('').map(bit => bit === '0' ? '1' : '0').join('');
        return this.binaryToIP(invertedMask)
    }

    calculateRequiredSubnets(hostCounts: number[]) {
        hostCounts.sort((a, b) => b - a)

        return hostCounts.map(count => {
            const requiredBits = Math.ceil(Math.log2(count + 2));
            return 32 - requiredBits;
        }).sort((a, b) => b - a);
    }

    allocateSubnets(ip: string, subnetMaskOrCIDR: string, hostsPerSubnet: number[]) {
        const networkAddress = this.calculateNetworkAddress(ip, subnetMaskOrCIDR);
        let currentNetwork = this.ipToBinary(networkAddress);
        const subnetSizes = this.calculateRequiredSubnets(hostsPerSubnet)
        subnetSizes.sort((a, b) => a - b)

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
export default NetUtilsLib;
