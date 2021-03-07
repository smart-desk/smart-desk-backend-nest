import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PhoneVerifyCheckDto } from './dto/phone-verify-check.dto';
const Nexmo = require('nexmo');

@Injectable()
export class PhoneService {
    // todo understand how to fix typings
    private nexmo: InstanceType<typeof Nexmo>;

    constructor(private config: ConfigService) {
        this.nexmo = new Nexmo({
            apiKey: this.config.get('NEXMO_KEY'),
            apiSecret: this.config.get('NEXMO_SECRET'),
        });
    }

    verifyRequest(phone: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.nexmo.verify.request(
                {
                    number: phone,
                    brand: 'Smart Desk', // todo use site's name
                    code_length: 4,
                },
                (err, result) => {
                    if (err) {
                        reject(err.error_text);
                    }
                    resolve(result.request_id);
                }
            );
        });
    }

    verifyCheck(body: PhoneVerifyCheckDto): Promise<string> {
        return new Promise((resolve, reject) => {
            this.nexmo.verify.check(
                {
                    request_id: body.requestId,
                    code: body.code,
                },
                (err, result) => {
                    if (err) {
                        reject(err.error_text);
                    }
                    resolve(result.status);
                }
            );
        });
    }
}
