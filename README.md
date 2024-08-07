# Network Utils Library (net-utils-lib)

A TypeScript library for network utilities.

## Installation

You can install `net-utils-lib` using npm:

```bash
npm install net-utils-lib
```

Or with yarn:

```bash
yarn add net-utils-lib
```

## Usage

Here's a basic example of how to use the `NetUtilsLib` class:

```typescript
import NetUtilsLib from 'net-utils-lib';

const netLib = new NetUtilsLib();

// Check if an IP address is valid
const isValid = netLib.isValidIPv4('192.168.1.1');
console.log(`Is valid IP: ${isValid}`);

// Calculate the network address
const networkAddress = netLib.calculateNetworkAddress('192.168.1.10', '255.255.255.0');
console.log(`Network Address: ${networkAddress}`);

// Calculate available IPs in a subnet
const availableIPs = netLib.calculateAvailableIPs('24');
console.log(`Available IPs: ${availableIPs}`);
```

## API

### `isValidIPv4(ip: string): boolean`

Checks if the provided IP address is a valid IPv4 address.

### `isValidCIDR(cidr: number): boolean`

Checks if the provided CIDR notation is valid.

### `getIPClass(ip: string): string`

Returns the class of the provided IP address.

### `ipToBinary(ip: string): string`

Converts an IP address to its binary representation.

### `binaryToIP(binary: string): string`

Converts a binary string to an IP address.

### `calculateSubnetMask(cidr: number): string`

Calculates the subnet mask for a given CIDR notation.

### `calculateCIDR(subnetMask: string): number`

Calculates the CIDR notation from a given subnet mask.

### `normalizeMaskToCIDR(subnetMaskOrCIDR: string): number`

Normalizes a subnet mask or CIDR notation to CIDR.

### `calculateNetworkAddress(ip: string, subnetMaskOrCIDR: string): string`

Calculates the network address for a given IP and subnet mask or CIDR.

### `calculateWildCardMask(subnetMaskOrCIDR: string): string`

Calculates the wild card mask for a given subnet mask or CIDR.

### `calculateBroadcastAddress(ip: string, subnetMaskOrCIDR: string): string`

Calculates the broadcast address for a given IP and subnet mask or CIDR.

### `calculateIPRange(networkAddress: string, subnetMaskOrCIDR: string): { firstIP: string; lastIP: string }`

Calculates the IP range for a given network address and subnet mask or CIDR.

### `calculateAvailableIPs(subnetMaskOrCIDR: string): number`

Calculates the number of available IPs in a subnet.

### `calculateRequiredSubnets(hostCounts: number[]): number[]`

Calculates the required subnets for given host counts.

### `allocateSubnets(ip: string, subnetMaskOrCIDR: string, hostsPerSubnet: number[]): { network: string; subnetMask: string; cidr: number; broadcast: string; firstIP: string; lastIP: string; availableIPs: number }[]`

Allocates subnets from a given IP address and subnet mask or CIDR.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
