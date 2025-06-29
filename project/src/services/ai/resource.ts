import { extractFileFromURL } from "../../utils/factory";
import type { Chapter, Section } from "../../utils/types";
import axios from 'axios'
import { getGeminiToken } from "./token";
import { generateChapter, generateSection } from "../../lib/gemini";



class ResourceModel{
    preChapters: string[] | undefined = []
    chapters: Chapter[] = [];
    sections: Section[] = [];
    
    constructor(
        private url: string = ''){
            this.url = url
    }
    // static initModel(docId: string): ResourceModel {
    //     return 
    // }
    loadResources = async() => {
        const url = this.url
        try{
            if(!url) throw Error('Failed to extract document.')
            const fileString = await extractFileFromURL(url)
        console.log('file string length:', fileString?.length)
            if(fileString) {
                    const l = 10_000
                for(let i = 0; i < fileString.length; i+l) {
                    this.preChapters?.push(fileString.slice(i, i+l))
                }
            }
            console.log('Number of pre chapters:', this.preChapters?.length)
            //break it down into chapters
            const chaptersData: {title: string; body: string, index?: number}[] = []
            this.preChapters?.forEach(async(ch, i)=>{
                const token = getGeminiToken()
                console.log('processing pre chapter', 1)
                const r = await generateChapter(token!, ch, chaptersData.map(cd=>cd.title),)
                console.log('process result:', r)
                chaptersData.push(...(r ?? []))
            })
            console.log('chapters:', chaptersData)
            const sectionsData: {title: string; body: string, index?: number}[] = []
            if(chaptersData.length) {
                chaptersData.forEach(async(chd)=>{
                    const token = getGeminiToken()
                    const r = await generateSection(token!, chd.body)
                    sectionsData.push(...(r ?? []))
                })
            }
            console.log('sections:', sectionsData)
            
        }catch(err){
            console.log('error loading resource::', err)
            throw err
        }
    }
    
}

export default ResourceModel