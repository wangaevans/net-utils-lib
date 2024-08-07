"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NetUtilsLib {
    constructor() {
        this.classRanges = {
            A: { start: 1, end: 126, defaultMask: '255.0.0.0' },
            B: { start: 128, end: 191, defaultMask: '255.255.0.0' },
            C: { start: 192, end: 223, defaultMask: '255.255.255.0' },
            D: { start: 224, end: 239, defaultMask: null },
            E: { start: 240, end: 255, defaultMask: null }
        };
    }
    isValidIPv4(ip) {
        const pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!pattern.test(ip))
            return false;
        return ip.split('.').every(octet => parseInt(octet) >= 0 && parseInt(octet) <= 255);
    }
    isValidCIDR(cidr) {
        return Number.isInteger(cidr) && cidr >= 0 && cidr <= 32;
    }
    getIPClass(ip) {
        if (!this.isValidIPv4(ip))
            throw new Error('Invalid IP address');
        const firstOctet = parseInt(ip.split('.')[0]);
        for (const [className, range] of Object.entries(this.classRanges)) {
            if (firstOctet >= range.start && firstOctet <= range.end)
                return className;
        }
        return 'Unknown';
    }
    ipToBinary(ip) {
        if (!this.isValidIPv4(ip))
            throw new Error('Invalid IP address');
        return ip.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join('');
    }
    binaryToIP(binary) {
        if (binary.length !== 32 || !/^[01]+$/.test(binary))
            throw new Error('Invalid binary string');
        return binary.match(/.{8}/g).map(octet => parseInt(octet, 2)).join('.');
    }
    calculateSubnetMask(cidr) {
        if (!this.isValidCIDR(cidr))
            throw new Error('Invalid CIDR notation');
        const mask = '1'.repeat(cidr).padEnd(32, '0');
        return this.binaryToIP(mask);
    }
    calculateCIDR(subnetMask) {
        if (!this.isValidIPv4(subnetMask))
            throw new Error('Invalid subnet mask');
        return this.ipToBinary(subnetMask).split('0')[0].length;
    }
    normalizeMaskToCIDR(subnetMaskOrCIDR) {
        if (this.isValidCIDR(parseInt(subnetMaskOrCIDR))) {
            return parseInt(subnetMaskOrCIDR);
        }
        else if (this.isValidIPv4(subnetMaskOrCIDR)) {
            return this.calculateCIDR(subnetMaskOrCIDR);
        }
        else {
            throw new Error('Invalid subnet mask or CIDR notation');
        }
    }
    calculateNetworkAddress(ip, subnetMaskOrCIDR) {
        if (!this.isValidIPv4(ip))
            throw new Error('Invalid IP address');
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const ipBinary = this.ipToBinary(ip);
        const maskBinary = this.ipToBinary(subnetMask);
        const networkBinary = ipBinary.split('').map((bit, index) => Number(bit) & Number(maskBinary[index])).join('');
        return this.binaryToIP(networkBinary);
    }
    calculateBroadcastAddress(ip, subnetMaskOrCIDR) {
        if (!this.isValidIPv4(ip))
            throw new Error('Invalid IP address');
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const ipBinary = this.ipToBinary(ip);
        const maskBinary = this.ipToBinary(subnetMask);
        const invertedMask = maskBinary.split('').map(bit => bit === '0' ? '1' : '0').join('');
        const broadcastBinary = ipBinary.split('').map((bit, index) => Number(bit) | Number(invertedMask[index])).join('');
        return this.binaryToIP(broadcastBinary);
    }
    calculateIPRange(networkAddress, subnetMaskOrCIDR) {
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const firstIP = this.incrementIP(networkAddress);
        const broadcast = this.calculateBroadcastAddress(networkAddress, subnetMask);
        const lastIP = this.decrementIP(broadcast);
        return { firstIP, lastIP };
    }
    incrementIP(ip) {
        const binary = BigInt(`0b${this.ipToBinary(ip)}`) + BigInt(1);
        return this.binaryToIP(binary.toString(2).padStart(32, '0'));
    }
    decrementIP(ip) {
        const binary = BigInt(`0b${this.ipToBinary(ip)}`) - BigInt(1);
        return this.binaryToIP(binary.toString(2).padStart(32, '0'));
    }
    calculateAvailableIPs(subnetMaskOrCIDR) {
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        return Math.pow(2, 32 - cidr) - 2;
    }
    calculateWildCardMask(subnetMaskOrCIDR) {
        const cidr = this.normalizeMaskToCIDR(subnetMaskOrCIDR);
        const subnetMask = this.calculateSubnetMask(cidr);
        const maskBinary = this.ipToBinary(subnetMask);
        const invertedMask = maskBinary.split('').map(bit => bit === '0' ? '1' : '0').join('');
        return this.binaryToIP(invertedMask);
    }
    calculateRequiredSubnets(hostCounts) {
        hostCounts.sort((a, b) => b - a);
        return hostCounts.map(count => {
            const requiredBits = Math.ceil(Math.log2(count + 2));
            return 32 - requiredBits;
        }).sort((a, b) => b - a);
    }
    allocateSubnets(ip, subnetMaskOrCIDR, hostsPerSubnet) {
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
exports.default = NetUtilsLib;
