# 1. تحديث وتثبيت الحزم الأساسية على Fedora
package %w(podman git curl wget vim certbot) do
  action :install
end

# 2. تمكين خدمة Podman Socket ليتكامل مع Terraform وDocker Compose
systemd_unit 'podman.socket' do
  action [:enable, :start]
end

# 3. ضبط حدود موارد النظام للـ Databases وSpring Boot
file '/etc/security/limits.d/99-skystore.conf' do
  content <<-EOF
  * soft nofile 65535
  * hard nofile 65535
  EOF
  mode '0644'
end

# 4. فتح المنافذ المطلوبة عبر FirewallD
%w(80/tcp 443/tcp 8085/tcp 8080/tcp).each do |port_def|
  execute "open_firewall_#{port_def}" do
    command "firewall-cmd --permanent --add-port=#{port_def} && firewall-cmd --reload"
    not_if "firewall-cmd --list-ports | grep -q #{port_def}"
  end
end
