import { type MigrationInterface, type QueryRunner } from "typeorm";

export class Init1624694372236 implements MigrationInterface {
  name = "Init1624694372236";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "group_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" TIMESTAMP WITH TIME ZONE, "endDate" TIMESTAMP WITH TIME ZONE, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "groupId" uuid, "actorId" uuid, CONSTRAINT "PK_65634517a244b69a8ef338d03c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "group_kind_enum" AS ENUM('Public', 'Private')`,
    );
    await queryRunner.query(
      `CREATE TABLE "group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" character varying(6) NOT NULL, "avatar" character varying, "kind" "group_kind_enum" NOT NULL, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "location" character varying NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "eventId" uuid, CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8dece3c96270b99f144d26e4a7" ON "link" ("url") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE, "location" json, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30c2f3bbaf6d34a55f8ae6e461" ON "event" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "actor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying NOT NULL, "username" character varying NOT NULL, "avatar" character varying, "color" character varying NOT NULL, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d4360c44758972f66e87becf6bd" UNIQUE ("username"), CONSTRAINT "PK_05b325494fcc996a44ae6928e5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "area" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "geometry" json NOT NULL, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_39d5e4de490139d6535d75f42ff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "article" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "draft" boolean NOT NULL DEFAULT true, "path" character varying NOT NULL, "featuredImage" character varying, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "page" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "path" character varying NOT NULL, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_742f4117e065c5b6ad21b37ba1f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "project_image_kind_enum" AS ENUM('THEORY', 'PRACTICE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "kind" "project_image_kind_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "imageId" uuid NOT NULL, "projectId" uuid NOT NULL, CONSTRAINT "PK_09b0ab9ec6330049e8a59289e32" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" character varying NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user" ("username") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_images_image" ("eventId" uuid NOT NULL, "imageId" uuid NOT NULL, CONSTRAINT "PK_2fbba8bd303e62a38636221247b" PRIMARY KEY ("eventId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4bf8c74b5f4a1113b2bca95201" ON "event_images_image" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fb0313bb02cfd78a2eb66ca6dc" ON "event_images_image" ("imageId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_groups_group" ("eventId" uuid NOT NULL, "groupId" uuid NOT NULL, CONSTRAINT "PK_5eb9540f7d4be5a3f31775a9380" PRIMARY KEY ("eventId", "groupId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7da98183ab5c393e83badea706" ON "event_groups_group" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_632d06b78600e438191d861756" ON "event_groups_group" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_actors_actor" ("eventId" uuid NOT NULL, "actorId" uuid NOT NULL, CONSTRAINT "PK_7d59a9e670c7beb87dd3e52ccf6" PRIMARY KEY ("eventId", "actorId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7a60826de16e95c99ac9b790b1" ON "event_actors_actor" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5908dd3112a84f84ae3d39931b" ON "event_actors_actor" ("actorId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_groups_members_group_member" ("eventId" uuid NOT NULL, "groupMemberId" uuid NOT NULL, CONSTRAINT "PK_8633a7ffd00d024feb7be4357cd" PRIMARY KEY ("eventId", "groupMemberId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3fa8d52ba682e1d10a9c65be47" ON "event_groups_members_group_member" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1557dc9d63a8f762584b9a6e1e" ON "event_groups_members_group_member" ("groupMemberId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "project_areas_area" ("projectId" uuid NOT NULL, "areaId" uuid NOT NULL, CONSTRAINT "PK_e43536251e50a9ea431b71f4e0a" PRIMARY KEY ("projectId", "areaId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62cafbc449a2411de7c264f062" ON "project_areas_area" ("projectId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ddbc42b34a83947249edda0f0c" ON "project_areas_area" ("areaId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member" ADD CONSTRAINT "FK_44c8964c097cf7f71434d6d1122" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member" ADD CONSTRAINT "FK_12da61769be46b89062180539ee" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD CONSTRAINT "FK_6429a5afe364d851f91401d37d4" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_image" ADD CONSTRAINT "FK_32cacd80729a4de8e11e92d20c1" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_image" ADD CONSTRAINT "FK_7b27cbd4456cc6313d8a476b32d" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" ADD CONSTRAINT "FK_4bf8c74b5f4a1113b2bca952019" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" ADD CONSTRAINT "FK_fb0313bb02cfd78a2eb66ca6dcd" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" ADD CONSTRAINT "FK_7da98183ab5c393e83badea7061" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" ADD CONSTRAINT "FK_632d06b78600e438191d861756b" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" ADD CONSTRAINT "FK_7a60826de16e95c99ac9b790b1f" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" ADD CONSTRAINT "FK_5908dd3112a84f84ae3d39931b0" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" ADD CONSTRAINT "FK_3fa8d52ba682e1d10a9c65be47e" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" ADD CONSTRAINT "FK_1557dc9d63a8f762584b9a6e1e7" FOREIGN KEY ("groupMemberId") REFERENCES "group_member"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" ADD CONSTRAINT "FK_62cafbc449a2411de7c264f0624" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" ADD CONSTRAINT "FK_ddbc42b34a83947249edda0f0cf" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" DROP CONSTRAINT "FK_ddbc42b34a83947249edda0f0cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" DROP CONSTRAINT "FK_62cafbc449a2411de7c264f0624"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" DROP CONSTRAINT "FK_1557dc9d63a8f762584b9a6e1e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" DROP CONSTRAINT "FK_3fa8d52ba682e1d10a9c65be47e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" DROP CONSTRAINT "FK_5908dd3112a84f84ae3d39931b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" DROP CONSTRAINT "FK_7a60826de16e95c99ac9b790b1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" DROP CONSTRAINT "FK_632d06b78600e438191d861756b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" DROP CONSTRAINT "FK_7da98183ab5c393e83badea7061"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" DROP CONSTRAINT "FK_fb0313bb02cfd78a2eb66ca6dcd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" DROP CONSTRAINT "FK_4bf8c74b5f4a1113b2bca952019"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_image" DROP CONSTRAINT "FK_7b27cbd4456cc6313d8a476b32d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_image" DROP CONSTRAINT "FK_32cacd80729a4de8e11e92d20c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" DROP CONSTRAINT "FK_6429a5afe364d851f91401d37d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member" DROP CONSTRAINT "FK_12da61769be46b89062180539ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member" DROP CONSTRAINT "FK_44c8964c097cf7f71434d6d1122"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_ddbc42b34a83947249edda0f0c"`);
    await queryRunner.query(`DROP INDEX "IDX_62cafbc449a2411de7c264f062"`);
    await queryRunner.query(`DROP TABLE "project_areas_area"`);
    await queryRunner.query(`DROP INDEX "IDX_1557dc9d63a8f762584b9a6e1e"`);
    await queryRunner.query(`DROP INDEX "IDX_3fa8d52ba682e1d10a9c65be47"`);
    await queryRunner.query(`DROP TABLE "event_groups_members_group_member"`);
    await queryRunner.query(`DROP INDEX "IDX_5908dd3112a84f84ae3d39931b"`);
    await queryRunner.query(`DROP INDEX "IDX_7a60826de16e95c99ac9b790b1"`);
    await queryRunner.query(`DROP TABLE "event_actors_actor"`);
    await queryRunner.query(`DROP INDEX "IDX_632d06b78600e438191d861756"`);
    await queryRunner.query(`DROP INDEX "IDX_7da98183ab5c393e83badea706"`);
    await queryRunner.query(`DROP TABLE "event_groups_group"`);
    await queryRunner.query(`DROP INDEX "IDX_fb0313bb02cfd78a2eb66ca6dc"`);
    await queryRunner.query(`DROP INDEX "IDX_4bf8c74b5f4a1113b2bca95201"`);
    await queryRunner.query(`DROP TABLE "event_images_image"`);
    await queryRunner.query(`DROP INDEX "IDX_78a916df40e02a9deb1c4b75ed"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(`DROP TABLE "project_image"`);
    await queryRunner.query(`DROP TYPE "project_image_kind_enum"`);
    await queryRunner.query(`DROP TABLE "page"`);
    await queryRunner.query(`DROP TABLE "article"`);
    await queryRunner.query(`DROP TABLE "area"`);
    await queryRunner.query(`DROP TABLE "actor"`);
    await queryRunner.query(`DROP INDEX "IDX_30c2f3bbaf6d34a55f8ae6e461"`);
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`DROP INDEX "IDX_8dece3c96270b99f144d26e4a7"`);
    await queryRunner.query(`DROP TABLE "link"`);
    await queryRunner.query(`DROP TABLE "image"`);
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`DROP TYPE "group_kind_enum"`);
    await queryRunner.query(`DROP TABLE "group_member"`);
  }
}
