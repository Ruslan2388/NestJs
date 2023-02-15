import { Controller, Get, Query } from '@nestjs/common';
import { BlogsSAService } from './blogs/blogs-SA.service';
import { BlogQueryDto } from '../blogs/BlogDto';

@Controller('sa')
export class SuperAdminController {
    constructor(protected blogsSAService: BlogsSAService) {}
    @Get('blogs')
    async getBlogs(@Query() queryData: BlogQueryDto) {
        return this.blogsSAService.getBlogsSa(queryData);
    }
}
