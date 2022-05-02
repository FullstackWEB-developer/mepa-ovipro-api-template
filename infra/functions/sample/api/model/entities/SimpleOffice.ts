import { oviproEntity } from '@almamedia/ovipro-common-entities';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    schema: 'public',
})
@oviproEntity
export class SimpleOffice {
    @PrimaryGeneratedColumn({ name: 'id' })
        id: number;

    @Column('uuid', { name: 'public_id', nullable: false })
        publicId: string;
}
