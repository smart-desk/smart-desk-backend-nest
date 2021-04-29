import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ChatMessageStatus {
    READ = 'read',
    UNREAD = 'unread',
}

@Entity('chat_messages')
export class ChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'chat_id' })
    chatId: string;

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @Column('varchar', { length: 1000 })
    content: string;

    @Column('varchar', { length: 100, default: ChatMessageStatus.UNREAD })
    status: ChatMessageStatus = ChatMessageStatus.UNREAD;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;
}
