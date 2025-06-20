import * as fs from 'fs';
import * as path from 'path';

export function GetGoogleCredentials(): string {
    //Fix credentials
    const credentialsPath = path.join(process.cwd(), "google.json");
    const creds = fs.existsSync(credentialsPath) ? fs.readFileSync(credentialsPath).toString() : '{}';
    return creds;
}

export function GetEnvStringOrDefault(key: string, def: string) {
    const env = process.env[key];
    if(env) {
        return key
    }
    return def
}

export function GetEnvStringOrFail(key: string) {
    const env = process.env[key];
    if(!env) {
        throw new Error(`Failed to retrieve env var: ${key}`);
    }
    return env;
}
