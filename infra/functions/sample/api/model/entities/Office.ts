import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { oviproEntity } from '../../dao/typeorm/EntityRegistry';

@Entity({
    schema: 'common',
})
@oviproEntity
export class Office {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column('uuid', { name: 'public_id', nullable: false })
    publicId: string;
}
