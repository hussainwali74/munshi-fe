-- Demo seed data for EZ Khata
-- Safe to run multiple times (uses UPSERT by fixed IDs / email).
--
-- Demo login:
--   Email: demo@ezkhata.pk
--   Phone: 0300-1112233
--   Password: Seed12345

-- 1) Demo user
insert into users (
    id,
    email,
    password_hash,
    full_name,
    business_name,
    shop_phone,
    shop_address,
    phone_number,
    categories
)
values (
    '11111111-1111-1111-1111-111111111111',
    'demo@ezkhata.pk',
    '$2b$10$x5b7D2DNitDkph22cToUH.B04r4ExbAVtALTM7IsdLnSusQ4oTaJO',
    'Demo Owner',
    'Demo Hardware Store',
    '0300-1112233',
    'Main Bazar, Lahore',
    '0300-1112233',
    array['sanitary', 'electrical', 'plumbing', 'paint']
)
on conflict (email) do update
set
    password_hash = excluded.password_hash,
    full_name = excluded.full_name,
    business_name = excluded.business_name,
    shop_phone = excluded.shop_phone,
    shop_address = excluded.shop_address,
    phone_number = excluded.phone_number,
    categories = excluded.categories;

-- 2) Customers
insert into customers (id, user_id, name, phone, cnic, address, balance)
values
    (
        '21111111-1111-1111-1111-111111111111',
        (select id from users where email = 'demo@ezkhata.pk'),
        'Ali Raza',
        '0301-5551122',
        '35202-1234567-1',
        'Johar Town, Lahore',
        6500
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        (select id from users where email = 'demo@ezkhata.pk'),
        'Sana Traders',
        '0302-7773344',
        '35202-2222222-2',
        'Model Town, Lahore',
        0
    ),
    (
        '23333333-3333-3333-3333-333333333333',
        (select id from users where email = 'demo@ezkhata.pk'),
        'Hamza Builders',
        '0303-8884455',
        '35202-3333333-3',
        'DHA Phase 6, Lahore',
        9000
    )
on conflict (id) do update
set
    user_id = excluded.user_id,
    name = excluded.name,
    phone = excluded.phone,
    cnic = excluded.cnic,
    address = excluded.address,
    balance = excluded.balance;

-- 3) Inventory
insert into inventory (
    id,
    user_id,
    name,
    category,
    quantity,
    unit,
    cost_price,
    selling_price,
    low_stock_threshold,
    size,
    color
)
values
    (
        '31111111-1111-1111-1111-111111111111',
        (select id from users where email = 'demo@ezkhata.pk'),
        'PPR Pipe 1in',
        'plumbing',
        80,
        'pcs',
        360,
        500,
        10,
        '1 inch',
        'Green'
    ),
    (
        '32222222-2222-2222-2222-222222222222',
        (select id from users where email = 'demo@ezkhata.pk'),
        'PVC Elbow 90deg',
        'plumbing',
        120,
        'pcs',
        70,
        120,
        20,
        '3/4 inch',
        'White'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        (select id from users where email = 'demo@ezkhata.pk'),
        'LED Bulb 12W',
        'electrical',
        55,
        'pcs',
        180,
        280,
        12,
        null,
        'Warm White'
    ),
    (
        '34444444-4444-4444-4444-444444444444',
        (select id from users where email = 'demo@ezkhata.pk'),
        'Wash Basin Mixer',
        'sanitary',
        18,
        'pcs',
        1800,
        2600,
        4,
        null,
        'Chrome'
    )
on conflict (id) do update
set
    user_id = excluded.user_id,
    name = excluded.name,
    category = excluded.category,
    quantity = excluded.quantity,
    unit = excluded.unit,
    cost_price = excluded.cost_price,
    selling_price = excluded.selling_price,
    low_stock_threshold = excluded.low_stock_threshold,
    size = excluded.size,
    color = excluded.color;

-- 4) Employees
insert into employees (id, user_id, name, role, phone, salary, join_date, status)
values
    (
        '41111111-1111-1111-1111-111111111111',
        (select id from users where email = 'demo@ezkhata.pk'),
        'Asif',
        'Salesman',
        '0311-2345678',
        32000,
        current_date - interval '140 days',
        'active'
    ),
    (
        '42222222-2222-2222-2222-222222222222',
        (select id from users where email = 'demo@ezkhata.pk'),
        'Iqra',
        'Cashier',
        '0312-3456789',
        38000,
        current_date - interval '95 days',
        'active'
    )
on conflict (id) do update
set
    user_id = excluded.user_id,
    name = excluded.name,
    role = excluded.role,
    phone = excluded.phone,
    salary = excluded.salary,
    join_date = excluded.join_date,
    status = excluded.status;

-- 5) Transactions
insert into transactions (
    id,
    user_id,
    customer_id,
    amount,
    type,
    description,
    date,
    created_at,
    items,
    bill_amount,
    paid_amount
)
values
    (
        '51111111-1111-1111-1111-111111111111',
        (select id from users where email = 'demo@ezkhata.pk'),
        '21111111-1111-1111-1111-111111111111',
        9000,
        'credit',
        'Bill #900001',
        now() - interval '7 days',
        now() - interval '7 days',
        '[{"name":"PPR Pipe 1in","qty":10,"price":500},{"name":"PVC Elbow 90deg","qty":20,"price":120},{"name":"LED Bulb 12W","qty":5,"price":280}]'::jsonb,
        9000,
        500
    ),
    (
        '52222222-2222-2222-2222-222222222222',
        (select id from users where email = 'demo@ezkhata.pk'),
        '21111111-1111-1111-1111-111111111111',
        2000,
        'debit',
        'Payment received for Bill #900001',
        now() - interval '4 days',
        now() - interval '4 days',
        null,
        2000,
        2000
    ),
    (
        '53333333-3333-3333-3333-333333333333',
        (select id from users where email = 'demo@ezkhata.pk'),
        '22222222-2222-2222-2222-222222222222',
        4200,
        'debit',
        'Bill #900002',
        now() - interval '2 days',
        now() - interval '2 days',
        '[{"name":"Wash Basin Mixer","qty":1,"price":2600},{"name":"PVC Elbow 90deg","qty":8,"price":120},{"name":"LED Bulb 12W","qty":2,"price":280}]'::jsonb,
        4200,
        4200
    ),
    (
        '54444444-4444-4444-4444-444444444444',
        (select id from users where email = 'demo@ezkhata.pk'),
        '23333333-3333-3333-3333-333333333333',
        12000,
        'credit',
        'Bill #900003',
        now() - interval '1 day',
        now() - interval '1 day',
        '[{"name":"PPR Pipe 1in","qty":12,"price":500},{"name":"Wash Basin Mixer","qty":2,"price":2600},{"name":"LED Bulb 12W","qty":3,"price":280}]'::jsonb,
        12000,
        2000
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        (select id from users where email = 'demo@ezkhata.pk'),
        '23333333-3333-3333-3333-333333333333',
        1000,
        'debit',
        'Partial payment for Bill #900003',
        now() - interval '12 hours',
        now() - interval '12 hours',
        null,
        1000,
        1000
    )
on conflict (id) do update
set
    user_id = excluded.user_id,
    customer_id = excluded.customer_id,
    amount = excluded.amount,
    type = excluded.type,
    description = excluded.description,
    date = excluded.date,
    created_at = excluded.created_at,
    items = excluded.items,
    bill_amount = excluded.bill_amount,
    paid_amount = excluded.paid_amount;

-- 6) Ensure seeded balances are exactly what the UI expects for this demo dataset.
update customers
set balance = case id
    when '21111111-1111-1111-1111-111111111111' then 6500
    when '22222222-2222-2222-2222-222222222222' then 0
    when '23333333-3333-3333-3333-333333333333' then 9000
    else balance
end
where id in (
    '21111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '23333333-3333-3333-3333-333333333333'
);
