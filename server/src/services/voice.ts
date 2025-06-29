import envVars from "../config/envVars";
import axios from 'axios';
import logger from 'jet-logger';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import Voice from "../models/voice";

const api_key: string = envVars.ELEVEN_LAB_API_KEY

class VoiceService{
    constructor(){}

    static loadVoicesToDB = async() =>{
        try{
            const client = new ElevenLabsClient({ apiKey: envVars.ELEVEN_LAB_API_KEY });
            const voiceRes = await client.voices.search({
                includeTotalCount: true
                });
            if(voiceRes.voices){
                await Promise.all(voiceRes.voices.map(async(voiceData)=>{
                    const existing = await Voice.findOne({ id: voiceData.voiceId })
                    if(!existing){
                        const created = await Voice.create({ id: voiceData.voiceId, name: voiceData.name })
                        return created
                    }else{
                        return existing
                    }
                }))
            }

        }catch(err){
            if(err){
                console.log('Error fetching from Voice API:', err)
            }
        }
    }

    static getVoiceByName = async(name: string) =>{
        return Voice.findOne({name})
    }

    static listVoices = async(options: any = {}) =>{
        return Voice.find(options)
    }

    static getVoiceById = async(id: string) =>{
        return Voice.findOne({ id })
    }

    static getRandomVoice = async()=>{
        const voices = await VoiceService.listVoices()
        if(!voices.length)return null
        const randIndex = Math.floor(Math.random() * voices.length)
        return voices[randIndex]
    }

    bufferTextToSpeech = async(text: string, voice_id: string) =>{

    }



}

export default VoiceService