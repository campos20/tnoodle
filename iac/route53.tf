# tnoodle.worldcubeassociation.org
resource "aws_route53_record" "project_record" {
  zone_id = data.aws_ssm_parameter.wca_zone_id.value
  name    = var.tnoodle_name
  type    = "A"

  alias {
    name                   = "dualstack.${aws_alb.tnoodle_load_balancer.dns_name}"
    evaluate_target_health = true
    zone_id                = aws_alb.tnoodle_load_balancer.zone_id
  }
}

# scramble.worldcubeassociation.org
resource "aws_route53_record" "project_record" {
  zone_id = data.aws_ssm_parameter.wca_zone_id.value
  name    = "scramble"
  type    = "A"

  alias {
    name                   = "dualstack.${aws_alb.tnoodle_load_balancer.dns_name}"
    evaluate_target_health = true
    zone_id                = aws_alb.tnoodle_load_balancer.zone_id
  }
}
