// src/mock.js
import Mock from 'mockjs';

// 登录
Mock.mock('/api/auth/login', 'post', () => {
    return {
        code: 200,
        msg: 'success',
        data: {
            data: {
                username: 'liuhu',
                nickname: '刘虎',
                phone: '18862609550',
                email: '1148247580@qq.com',
                tokenName: 'token',
                tokenValue: 'v1_52V3YQWwA42CI8_S09FBJGZ1cwe5VWR__',
                permissions: ['user'],
                roles: ['admin']
            }
        }
    };
});

// 获取当前登录用户信息
Mock.mock('/api/auth/getUserInfo', 'post', () => {
    return {
        code: 200,
        msg: 'success',
        data: {
            username: 'liuhu',
            nickname: '刘虎',
            phone: '18862609550',
            email: '1148247580@qq.com',
            tokenName: null,
            tokenValue: null,
            permissions: ['user'],
            roles: ['admin']
        }
    };
});

// 获取当前用户信息的代码列表
Mock.mock('/api/codeShare/getCodesList', 'post', options => {
    console.log('options', options);

    const params = JSON.parse(options.body);
    // 获取参数中的数量
    const count = parseInt(params.pageSize) || 10; // 默认返回10条数据
    // 示例用户数据
    const codes = Mock.mock({
        [`codes|${count}`]: [
            {
                'id|+1': 1,
                title: '@sentence(10)',
                description: '@paragraph(20)',
                visibility: 'public',
                password: null,
                'cover|1': [
                    'i05.c.aliimg.com/img/ibank/2015/787/102/2188201787_1912208232.jpg?__r__=1432515204099',
                    'www.seo1158.com/uploads/allimg/190819/1566176952124982.jpg',
                    'img0.baidu.com/it/u=2201714512,2559894994&fm=253&fmt=auto&app=138&f=JPEG?w=720&h=314',
                    'img-blog.csdnimg.cn/img_convert/2709a6457325f333f201534d8c30bf89.png',
                    'img-blog.csdnimg.cn/img_convert/fd3d8d737407ac66ac52a4fbbdac97a9.png'
                ]
            }
        ]
    });
    return {
        code: 200,
        msg: 'success',
        data: {
            total: count * 3,
            pageNum: 1,
            pageSize: 10,
            rows: codes.codes
        }
    };
});

// 获取当前用户信息的代码列表
Mock.mock('/api/codeShare/getMyCodesList', 'post', options => {
    console.log('options', options);

    const params = JSON.parse(options.body);
    // 获取参数中的数量
    const count = parseInt(params.pageSize) || 10; // 默认返回10条数据
    // 示例用户数据
    const codes = Mock.mock({
        [`codes|${count}`]: [
            {
                'id|+1': 1,
                title: '@sentence(10)',
                description: '@paragraph(20)',
                visibility: 'public',
                password: null,
                'cover|1': [
                    'i05.c.aliimg.com/img/ibank/2015/787/102/2188201787_1912208232.jpg?__r__=1432515204099',
                    'www.seo1158.com/uploads/allimg/190819/1566176952124982.jpg',
                    'img0.baidu.com/it/u=2201714512,2559894994&fm=253&fmt=auto&app=138&f=JPEG?w=720&h=314',
                    'img-blog.csdnimg.cn/img_convert/2709a6457325f333f201534d8c30bf89.png',
                    'img-blog.csdnimg.cn/img_convert/fd3d8d737407ac66ac52a4fbbdac97a9.png'
                ]
            }
        ]
    });
    return {
        code: 200,
        msg: 'success',
        data: {
            total: count,
            pageNum: 1,
            pageSize: 10,
            rows: codes.codes
        }
    };
});

// 获取当前用户信息的代码列表
Mock.mock('/api/codeShare/getMyFavourList', 'post', options => {
    console.log('options', options);

    const params = JSON.parse(options.body);
    // 获取参数中的数量
    const count = parseInt(params.pageSize) || 10; // 默认返回10条数据
    // 示例用户数据
    const codes = Mock.mock({
        [`codes|${count}`]: [
            {
                'id|+1': 1,
                title: '@sentence(10)',
                description: '@paragraph(20)',
                visibility: 'public',
                password: null,
                'cover|1': [
                    'i05.c.aliimg.com/img/ibank/2015/787/102/2188201787_1912208232.jpg?__r__=1432515204099',
                    'www.seo1158.com/uploads/allimg/190819/1566176952124982.jpg',
                    'img0.baidu.com/it/u=2201714512,2559894994&fm=253&fmt=auto&app=138&f=JPEG?w=720&h=314',
                    'img-blog.csdnimg.cn/img_convert/2709a6457325f333f201534d8c30bf89.png',
                    'img-blog.csdnimg.cn/img_convert/fd3d8d737407ac66ac52a4fbbdac97a9.png'
                ]
            }
        ]
    });
    return {
        code: 200,
        msg: 'success',
        data: {
            total: count * 2,
            pageNum: 1,
            pageSize: 10,
            rows: codes.codes
        }
    };
});

export default Mock;
