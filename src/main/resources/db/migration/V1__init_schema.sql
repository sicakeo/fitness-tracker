create table exercises (
    met_value float(53),
    id bigint not null auto_increment,
    user_id bigint not null,
    name varchar(255) not null,
    exercise_type enum ('CORE_STRENGTH','DANCE','HIIT_CARDIO','MIND_BODY','OTHER') not null,
    primary key (id)
) engine=InnoDB;

create table food_entries (
    calories float(53) check (calories>=0),
    carbs float(53) check (carbs>=0),
    date date not null,
    fat float(53) check (fat>=0),
    protein float(53) check (protein>=0),
    id bigint not null auto_increment,
    user_id bigint not null,
    name varchar(255) not null,
    meal_type enum ('BREAKFAST','DINNER','LUNCH','SNACK') not null,
    primary key (id)
) engine=InnoDB;

create table users (
    activity_level float(53) check (activity_level>=0),
    age integer check (age>=0),
    fitness_goal tinyint check (fitness_goal between 0 and 4),
    height float(53),
    tdee float(53),
    weight float(53),
    id bigint not null auto_increment,
    email varchar(255) not null,
    gender varchar(255),
    name varchar(255),
    password varchar(255) not null,
    username varchar(255) not null,
    primary key (id)
) engine=InnoDB;

create table workout_entries (
    distance_km float(53) check (distance_km>=0),
    duration_minutes integer check (duration_minutes>=0),
    nums_reps integer check (nums_reps>=0),
    nums_sets integer check (nums_sets>=0),
    weight float(53) check (weight>=0),
    exercise_id bigint not null,
    id bigint not null auto_increment,
    session_id bigint not null,
    intensity enum ('HEAVY','LIGHT','MODERATE'),
    primary key (id)
) engine=InnoDB;

create table workout_sessions (
    calories_burned float(53),
    date date not null,
    duration_minutes integer,
    id bigint not null auto_increment,
    user_id bigint not null,
    title varchar(255),
    primary key (id)
) engine=InnoDB;

alter table exercises 
   add constraint FKkiftckymv693t6yxogsb50n4y 
   foreign key (user_id) 
   references users (id);

alter table food_entries 
   add constraint FKdq1g031i660pshi5p37ts7cb7 
   foreign key (user_id) 
   references users (id);

alter table workout_entries 
   add constraint FKaynj8qbv9vddyb93qx4oi3mcg 
   foreign key (exercise_id) 
   references exercises (id);

alter table workout_entries 
   add constraint FK7odouchjjhpqd6ev517f1g9ds 
   foreign key (session_id) 
   references workout_sessions (id);

alter table workout_sessions 
   add constraint FKfwqciawyjntpphp080wpa37ge 
   foreign key (user_id) 
   references users (id);