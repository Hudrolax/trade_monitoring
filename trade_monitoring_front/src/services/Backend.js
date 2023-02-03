const BASE_URL = 'http://app/';

class Backend {
    getResource = async (url) => {
        // console.log('try to get resource')
        let res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`)
        }
        return await res.json();
    }

    getMonitoring = async () => {
        const res = await this.getResource(BASE_URL + 'monitoring')
        return res
    }

    getEquity = async () => {
        const res = await this.getResource(BASE_URL + 'equity')
        return res
    }

    getPerformance = async () => {
        const res = await this.getResource(BASE_URL + 'performance')
        return res
    }
}

export default Backend;