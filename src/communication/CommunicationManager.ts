import IncomingMessage from './incoming/IncomingMessage';
import YoutubeTVEvent from './incoming/youtube/YoutubeTVEvent';
import OutgoingMessage from './outgoing/OutgoingMessage';
import Store from '@/store/Store';
import Logger from '@/utils/Logger';
import MentionEvent from './incoming/general/MentionEvent';
import SlotMachineEvent from './incoming/slot-machine/SlotMachineEvent';
import SpinResultEvent from './incoming/slot-machine/SpinResultEvent';
import SessionDataEvent from './incoming/general/SessionDataEvent';
import UpdateCreditsEvent from './incoming/general/UpdateCreditsEvent';
import CommandsEvent from './incoming/general/CommandsEvent';

export default class CommunicationManager {
    private _events : Map<String, IncomingMessage>;
    private static _instance: CommunicationManager = new CommunicationManager();

    constructor() {
        this._events = new Map<String, IncomingMessage>();
        this.RegisterMessages();
    }

    private RegisterMessages() {
        this._events.set("youtube_tv", new YoutubeTVEvent());
        this._events.set("mention", new MentionEvent());
        this._events.set("slot_machine", new SlotMachineEvent());
        this._events.set("slot_result", new SpinResultEvent());
        this._events.set("session_data", new SessionDataEvent());
        this._events.set("update_credits", new UpdateCreditsEvent());
        this._events.set("commands", new CommandsEvent());
    }

    public SendMessage(message: OutgoingMessage) : void{
        if (!Store.GetInstance().connected || !message)
            return;
        let swfObject: any = document.querySelector('object, embed') as any;
        if(swfObject)
            swfObject.openroom(JSON.stringify(message));
    }

    public OnMessage(message: string) : void{
        let json = JSON.parse(message);
        let parser = this._events.get(json.header);
        if(parser) {
            parser.Parse(json.data);
        } else {
            Logger.Log(json);
        }
    }

    public getMessages() : Map<String, IncomingMessage> {
        return this._events;
    }

    public static getInstance(): CommunicationManager {
        return this._instance;
    }
}