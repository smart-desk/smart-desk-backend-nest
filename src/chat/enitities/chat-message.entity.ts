import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;
}
